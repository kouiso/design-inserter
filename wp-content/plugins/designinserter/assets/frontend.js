( function() {
	'use strict';

	var initializedAttribute = 'data-designinserter-initialized';
	var uid = 0;

	function nextId( prefix ) {
		uid += 1;
		return prefix + '-' + uid;
	}

	function isFocusable( element ) {
		if ( ! element || element.disabled ) {
			return false;
		}

		var name = element.tagName ? element.tagName.toLowerCase() : '';
		return element.tabIndex >= 0 || /^(a|button|input|select|textarea)$/.test( name );
	}

	function ensureFocusable( element ) {
		if ( element && ! isFocusable( element ) ) {
			element.setAttribute( 'tabindex', '0' );
		}
	}

	function getPartRoot( part ) {
		var selector = part.getAttribute( 'data-designinserter-root-selector' );
		if ( selector ) {
			try {
				return part.querySelector( selector ) || part;
			} catch ( error ) {
				return part;
			}
		}

		return part.firstElementChild || part;
	}

	function setChecked( input, checked ) {
		if ( ! input ) {
			return;
		}

		input.checked = checked;
		input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
	}

	function handleButtonKey( event, callback ) {
		if ( event.key !== 'Enter' && event.key !== ' ' ) {
			return;
		}

		event.preventDefault();
		callback();
	}

	function enhanceScrollTop( part, root ) {
		var button = root.matches( 'button, a' ) ? root : root.querySelector( 'button, a' );
		if ( ! button ) {
			return;
		}

		if ( button.tagName.toLowerCase() === 'button' && ! button.getAttribute( 'type' ) ) {
			button.setAttribute( 'type', 'button' );
		}

		if ( ! button.getAttribute( 'aria-label' ) ) {
			button.setAttribute( 'aria-label', 'Scroll to top' );
		}

		button.addEventListener( 'click', function( event ) {
			event.preventDefault();
			window.scrollTo( { top: 0, behavior: 'smooth' } );
		} );
	}

	function enhanceTooltip( part, root ) {
		var trigger = root.firstElementChild;
		var tooltip = root.querySelector( 'span, p' );
		if ( ! trigger || ! tooltip ) {
			return;
		}

		var tooltipId = tooltip.id || nextId( 'designinserter-tooltip' );
		tooltip.id = tooltipId;
		tooltip.setAttribute( 'role', 'tooltip' );
		trigger.setAttribute( 'aria-describedby', tooltipId );
		ensureFocusable( trigger );

		function show() {
			root.classList.add( 'designinserter-tooltip-visible' );
		}

		function hide() {
			root.classList.remove( 'designinserter-tooltip-visible' );
		}

		trigger.addEventListener( 'focus', show );
		trigger.addEventListener( 'blur', hide );
		root.addEventListener( 'mouseenter', show );
		root.addEventListener( 'mouseleave', hide );
	}

	function enhanceReadMore( part, root ) {
		var checkbox = root.querySelector( 'input[type="checkbox"]' );
		var label = root.querySelector( 'label' );
		var content = root.querySelector( 'p' );
		if ( ! checkbox || ! label || ! content ) {
			return;
		}

		var contentId = content.id || nextId( 'designinserter-read-more' );
		content.id = contentId;
		label.setAttribute( 'role', 'button' );
		label.setAttribute( 'aria-controls', contentId );
		ensureFocusable( label );

		function sync() {
			label.setAttribute( 'aria-expanded', checkbox.checked ? 'true' : 'false' );
		}

		label.addEventListener( 'keydown', function( event ) {
			handleButtonKey( event, function() {
				setChecked( checkbox, ! checkbox.checked );
			} );
		} );
		checkbox.addEventListener( 'change', sync );
		sync();
	}

	function getTabs( root ) {
		return Array.prototype.slice.call( root.querySelectorAll( ':scope > label' ) )
			.map( function( label ) {
				var input = label.querySelector( 'input[type="radio"]' );
				var panel = label.nextElementSibling;
				return input && panel ? { label: label, input: input, panel: panel } : null;
			} )
			.filter( Boolean );
	}

	function enhanceTabs( part, root ) {
		var tabs = getTabs( root );
		if ( ! tabs.length ) {
			return;
		}

		root.setAttribute( 'role', 'tablist' );

		function selectTab( index, focus ) {
			tabs.forEach( function( tab, tabIndex ) {
				var selected = tabIndex === index;
				setChecked( tab.input, selected );
				tab.label.setAttribute( 'aria-selected', selected ? 'true' : 'false' );
				tab.label.setAttribute( 'tabindex', selected ? '0' : '-1' );
				tab.panel.hidden = ! selected;
			} );

			if ( focus ) {
				tabs[index].label.focus();
			}
		}

		tabs.forEach( function( tab, index ) {
			var tabId = tab.label.id || nextId( 'designinserter-tab' );
			var panelId = tab.panel.id || nextId( 'designinserter-panel' );
			tab.label.id = tabId;
			tab.panel.id = panelId;
			tab.label.setAttribute( 'role', 'tab' );
			tab.label.setAttribute( 'aria-controls', panelId );
			tab.panel.setAttribute( 'role', 'tabpanel' );
			tab.panel.setAttribute( 'aria-labelledby', tabId );

			tab.label.addEventListener( 'click', function() {
				window.setTimeout( function() {
					selectTab( index, false );
				}, 0 );
			} );

			tab.label.addEventListener( 'keydown', function( event ) {
				var nextIndex = index;
				if ( event.key === 'ArrowRight' || event.key === 'ArrowDown' ) {
					nextIndex = ( index + 1 ) % tabs.length;
				} else if ( event.key === 'ArrowLeft' || event.key === 'ArrowUp' ) {
					nextIndex = ( index - 1 + tabs.length ) % tabs.length;
				} else if ( event.key === 'Home' ) {
					nextIndex = 0;
				} else if ( event.key === 'End' ) {
					nextIndex = tabs.length - 1;
				} else {
					return;
				}

				event.preventDefault();
				selectTab( nextIndex, true );
			} );
		} );

		var checkedIndex = tabs.findIndex( function( tab ) {
			return tab.input.checked;
		} );
		selectTab( checkedIndex >= 0 ? checkedIndex : 0, false );
	}

	function enhanceModal( part, root ) {
		var openInput = root.querySelector( 'input[id*="open"]' );
		var closeInput = root.querySelector( 'input[id*="close"]' );
		var openLabel = openInput && root.querySelector( 'label[for="' + openInput.id + '"]' );
		var closeLabels = closeInput ? Array.prototype.slice.call( root.querySelectorAll( 'label[for="' + closeInput.id + '"]' ) ) : [];
		var modal = Array.prototype.slice.call( root.children ).find( function( child ) {
			return child.className && String( child.className ).indexOf( 'modal-' ) !== -1;
		} );
		var content = root.querySelector( '[class*="__content-wrap"]' ) || root.querySelector( '[class*="__content"]' );
		if ( ! openInput || ! closeInput || ! openLabel || ! modal ) {
			return;
		}

		var previousFocus = null;
		var modalId = modal.id || nextId( 'designinserter-modal' );
		modal.id = modalId;
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		modal.setAttribute( 'aria-hidden', openInput.checked ? 'false' : 'true' );
		openLabel.setAttribute( 'role', 'button' );
		openLabel.setAttribute( 'aria-controls', modalId );
		ensureFocusable( openLabel );

		closeLabels.forEach( function( label ) {
			label.setAttribute( 'role', 'button' );
			ensureFocusable( label );
			label.addEventListener( 'keydown', function( event ) {
				handleButtonKey( event, function() {
					closeModal();
				} );
			} );
		} );

		function sync() {
			var opened = openInput.checked;
			modal.setAttribute( 'aria-hidden', opened ? 'false' : 'true' );
			openLabel.setAttribute( 'aria-expanded', opened ? 'true' : 'false' );
			document.body.classList.toggle( 'designinserter-modal-open', opened );
		}

		function openModal() {
			previousFocus = document.activeElement;
			setChecked( openInput, true );
			window.setTimeout( function() {
				ensureFocusable( content );
				if ( content ) {
					content.focus();
				}
			}, 0 );
		}

		function closeModal() {
			setChecked( closeInput, true );
			if ( previousFocus && previousFocus.focus ) {
				previousFocus.focus();
			}
		}

		openLabel.addEventListener( 'keydown', function( event ) {
			handleButtonKey( event, openModal );
		} );
		openLabel.addEventListener( 'click', function() {
			previousFocus = document.activeElement;
			window.setTimeout( function() {
				if ( openInput.checked ) {
					ensureFocusable( content );
					if ( content ) {
						content.focus();
					}
				}
			}, 0 );
		} );
		openInput.addEventListener( 'change', sync );
		closeInput.addEventListener( 'change', sync );
		document.addEventListener( 'keydown', function( event ) {
			if ( event.key === 'Escape' && openInput.checked ) {
				closeModal();
			}
		} );
		sync();
	}

	function injectBaseStyles() {
		if ( document.getElementById( 'designinserter-frontend-inline-style' ) ) {
			return;
		}

		var style = document.createElement( 'style' );
		style.id = 'designinserter-frontend-inline-style';
		style.textContent = [
			'.designinserter-tooltip-visible > span,.designinserter-tooltip-visible > p{visibility:visible!important;opacity:1!important;}',
			'.designinserter-part [role="button"]:focus-visible,.designinserter-part [role="tab"]:focus-visible{outline:2px solid #1e75bb;outline-offset:2px;}',
			'body.designinserter-modal-open{overflow:hidden;}'
		].join( '' );
		document.head.appendChild( style );
	}

	function enhancePart( part ) {
		if ( part.getAttribute( initializedAttribute ) ) {
			return;
		}

		part.setAttribute( initializedAttribute, 'true' );
		var behavior = part.getAttribute( 'data-designinserter-behavior' );
		var root = getPartRoot( part );

		if ( behavior === 'scrollTop' ) {
			enhanceScrollTop( part, root );
		} else if ( behavior === 'tooltip' ) {
			enhanceTooltip( part, root );
		} else if ( behavior === 'readMore' ) {
			enhanceReadMore( part, root );
		} else if ( behavior === 'tabs' ) {
			enhanceTabs( part, root );
		} else if ( behavior === 'modal' ) {
			enhanceModal( part, root );
		}
	}

	function init( root ) {
		injectBaseStyles();
		Array.prototype.forEach.call(
			( root || document ).querySelectorAll( '.designinserter-part[data-designinserter-behavior]' ),
			enhancePart
		);
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', function() {
			init( document );
		} );
	} else {
		init( document );
	}

	if ( 'MutationObserver' in window ) {
		new MutationObserver( function( mutations ) {
			mutations.forEach( function( mutation ) {
				Array.prototype.forEach.call( mutation.addedNodes, function( node ) {
					if ( node.nodeType === 1 ) {
						if ( node.matches && node.matches( '.designinserter-part[data-designinserter-behavior]' ) ) {
							enhancePart( node );
						}
						if ( node.querySelectorAll ) {
							init( node );
						}
					}
				} );
			} );
		} ).observe( document.documentElement, { childList: true, subtree: true } );
	}

	window.DesignInserterFrontend = window.DesignInserterFrontend || {};
	window.DesignInserterFrontend.init = init;
} )();
