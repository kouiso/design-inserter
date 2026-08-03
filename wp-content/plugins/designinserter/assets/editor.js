( function( blocks, element, blockEditor, components, i18n, data ) {
	var el = element.createElement;
	var useState = element.useState;
	var useEffect = element.useEffect;
	var Fragment = element.Fragment;
	var useRef = element.useRef;
	var useSelect = data && data.useSelect ? data.useSelect : null;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var Button = components.Button;
	var Spinner = components.Spinner;
	var Notice = components.Notice;
	var __ = i18n.__;
	var catalog = window.DesignInserterCatalog || {};
	var allParts = catalog.parts || [];
	var allTemplates = catalog.templates || [];
	var sources = catalog.sources || [];
	var restUrl = catalog.restUrl || '';
	var templatesRestUrl = catalog.templatesRestUrl || '';
	var nonce = catalog.nonce || '';

	function getPartById( partId ) {
		for ( var i = 0; i < allParts.length; i++ ) {
			if ( allParts[ i ].id === partId ) {
				return allParts[ i ];
			}
		}
		return null;
	}

	function getDefaultParams( inputs ) {
		var params = {};
		if ( ! inputs || typeof inputs !== 'object' ) {
			return params;
		}
		[ 'colors', 'radios', 'ranges' ].forEach( function( group ) {
			var arr = inputs[ group ] || [];
			arr.forEach( function( input ) {
				if ( input && input.key ) {
					params[ input.key ] = input.defaultValue;
				}
			} );
		} );
		return params;
	}

	function buildCodeFuncParams( params, inputs ) {
		var result = { colors: [], radios: [], ranges: [] };
		if ( ! inputs || typeof inputs !== 'object' ) {
			return result;
		}
		[ 'colors', 'radios', 'ranges' ].forEach( function( group ) {
			var arr = inputs[ group ] || [];
			result[ group ] = arr.map( function( input ) {
				if ( params && input.key in params ) {
					return params[ input.key ];
				}
				return input.defaultValue;
			} );
		} );
		return result;
	}

	function computePartContent( partId, params ) {
		var codeFuncs = window.designInserterPartCodeFuncs || {};
		var codeFunc = codeFuncs[ partId ];
		if ( ! codeFunc ) {
			return null;
		}
		var part = getPartById( partId );
		var inputs = part && part.inputs ? part.inputs : {};
		try {
			return codeFunc( buildCodeFuncParams( params, inputs ) );
		} catch ( err ) {
			if ( window.console ) {
				window.console.error( 'DesignInserter codeFunc error:', err );
			}
			return null;
		}
	}

	function fetchPartContent( partId, callback, signal ) {
		window.fetch( restUrl + partId, {
			headers: { 'X-WP-Nonce': nonce },
			signal: signal
		} )
			.then( function( res ) {
				if ( ! res.ok ) {
					var httpErr = new Error( 'http_' + res.status );
					httpErr.status = res.status;
					throw httpErr;
				}
				return res.json();
			} )
			.then( function( data ) { callback( null, data ); } )
			.catch( function( err ) {
				if ( err && err.name === 'AbortError' ) { return; }
				callback( err || new Error( 'unknown' ), null );
			} );
	}

	function PartCard( props ) {
		var part = props.part;
		var isSelected = props.isSelected;
		var onClick = props.onClick;

		return el( 'button', {
			type: 'button',
			className: 'di-card' + ( isSelected ? ' is-selected' : '' ),
			onClick: onClick,
			'aria-pressed': isSelected ? 'true' : 'false',
			'aria-label': part.title,
			title: part.title
		},
			part.previewImage
				? el( 'img', {
					className: 'di-card__img',
					src: part.previewImage,
					alt: '',
					'aria-hidden': 'true',
					loading: 'lazy'
				} )
				: el( 'div', { className: 'di-card__placeholder', 'aria-hidden': 'true' }, '️' ),
			isSelected ? el( 'span', { className: 'di-card__selected-badge' }, '選択中' ) : null,
			el( 'span', { className: 'di-card__title', 'aria-hidden': 'true' }, part.title )
		);
	}

	function TemplateCard( props ) {
		var template = props.template;
		var isSelected = props.isSelected;
		var onClick = props.onClick;

		return el( 'button', {
			type: 'button',
			className: 'di-card di-card--template' + ( isSelected ? ' is-selected' : '' ),
			onClick: onClick,
			'aria-pressed': isSelected ? 'true' : 'false',
			'aria-label': template.title,
			title: template.title
		},
			template.previewImage
				? el( 'img', {
					className: 'di-card__img',
					src: template.previewImage,
					alt: '',
					'aria-hidden': 'true',
					loading: 'lazy'
				} )
				: el( 'div', { className: 'di-card__placeholder', 'aria-hidden': 'true' }, '' ),
			isSelected ? el( 'span', { className: 'di-card__selected-badge' }, '選択中' ) : null,
			el( 'span', { className: 'di-card__title', 'aria-hidden': 'true' }, template.title ),
			el( 'span', { className: 'di-card__badge', 'aria-hidden': 'true' }, 'テンプレ' )
		);
	}

	function ItemPicker( props ) {
		var onSelectPart = props.onSelectPart;
		var onSelectTemplate = props.onSelectTemplate;
		var currentPartId = props.currentPartId;
		var currentTemplateId = props.currentTemplateId;

		var searchState = useState( '' );
		var search = searchState[0];
		var setSearch = searchState[1];

		var catState = useState( '' );
		var activeCat = catState[0];
		var setActiveCat = catState[1];

		var sourceState = useState( 'all' );
		var activeSource = sourceState[0];
		var setActiveSource = sourceState[1];

		var visibleParts = allParts.filter( function( p ) {
			return activeSource === 'all' || p.source === activeSource;
		} );
		var visibleTemplates = ( activeSource === 'all' || activeSource === 'template-party' ) ? allTemplates : [];

		var catSet = {};
		var categories = [];
		visibleParts.concat( visibleTemplates ).forEach( function( item ) {
			if ( item.categoryLabel && ! catSet[ item.categoryLabel ] ) {
				catSet[ item.categoryLabel ] = true;
				categories.push( item.categoryLabel );
			}
		} );

		var filteredParts = visibleParts.filter( function( p ) {
			if ( activeCat && p.categoryLabel !== activeCat ) { return false; }
			if ( search ) {
				var q = search.toLowerCase();
				return p.title.toLowerCase().indexOf( q ) !== -1 ||
					( p.categoryLabel || '' ).toLowerCase().indexOf( q ) !== -1 ||
					p.id.toLowerCase().indexOf( q ) !== -1;
			}
			return true;
		} );

		var filteredTemplates = visibleTemplates.filter( function( t ) {
			if ( activeCat && t.categoryLabel !== activeCat ) { return false; }
			if ( search ) {
				var q = search.toLowerCase();
				return t.title.toLowerCase().indexOf( q ) !== -1 ||
					( t.categoryLabel || '' ).toLowerCase().indexOf( q ) !== -1 ||
					t.id.toLowerCase().indexOf( q ) !== -1;
			}
			return true;
		} );

		var totalVisible = filteredParts.length + filteredTemplates.length;
		var totalAll = visibleParts.length + visibleTemplates.length;
		var hasActiveFilter = search !== '' || activeCat !== '';
		var clearFilters = function() { setSearch( '' ); setActiveCat( '' ); };

		return el( 'div', { className: 'di-picker' },
			el( 'div', { className: 'di-picker__guide' },
				el( 'strong', {}, '探す' ),
				el( 'span', {}, ' キーワードやカテゴリで候補を絞り込みます。' )
			),
			sources.length > 0
				? el( 'div', { className: 'di-picker__sources', role: 'group', 'aria-label': 'Source filter' },
					sources.map( function( src ) {
						return el( Button, {
							key: src.id,
							className: 'di-picker__source',
							variant: activeSource === src.id ? 'primary' : 'secondary',
							size: 'small',
							'aria-pressed': activeSource === src.id ? 'true' : 'false',
							onClick: function() { setActiveSource( src.id ); setActiveCat( '' ); }
						}, src.label );
					} )
				  )
				: null,
			el( TextControl, {
				placeholder: 'デザインを検索...',
				value: search,
				onChange: setSearch,
				className: 'di-picker__search'
			} ),
			el( 'div', { className: 'di-picker__cats', role: 'group', 'aria-label': 'カテゴリ' },
				el( Button, {
					variant: activeCat === '' ? 'primary' : 'tertiary',
					size: 'small',
					'aria-pressed': activeCat === '' ? 'true' : 'false',
					onClick: function() { setActiveCat( '' ); }
				}, '全て', ' ', el( 'span', { 'aria-hidden': 'true' }, '(' + totalAll + ')' ) ),
				categories.map( function( cat ) {
					var count = visibleParts.filter( function( p ) { return p.categoryLabel === cat; } ).length
					          + visibleTemplates.filter( function( t ) { return t.categoryLabel === cat; } ).length;
					return el( Button, {
						key: cat,
						variant: activeCat === cat ? 'primary' : 'tertiary',
						size: 'small',
						'aria-pressed': activeCat === cat ? 'true' : 'false',
						onClick: function() { setActiveCat( cat ); }
					}, cat, ' ', el( 'span', { 'aria-hidden': 'true' }, '(' + count + ')' ) );
				} )
			),
			el( 'div', { className: 'di-picker__grid', role: 'list' },
				filteredParts.map( function( part ) {
					return el( PartCard, {
						key: part.id,
						part: part,
						isSelected: part.id === currentPartId,
						onClick: function() { onSelectPart( part ); }
					} );
				} ),
				filteredTemplates.map( function( template ) {
					return el( TemplateCard, {
						key: template.id,
						template: template,
						isSelected: template.id === currentTemplateId,
						onClick: function() { onSelectTemplate( template ); }
					} );
				} )
			),
			totalVisible === 0
				? el( 'div', { className: 'di-picker__empty' },
					el( 'p', {}, '該当するデザインがありません' ),
					hasActiveFilter
						? el( Button, {
							variant: 'secondary',
							size: 'small',
							onClick: clearFilters
						}, '検索 / カテゴリをクリア' )
						: null
				  )
				: null
		);
	}

	function getInputLabel( input ) {
		if ( input.legend && input.legend.ja ) {
			return input.legend.ja;
		}
		if ( input.legend && input.legend.en ) {
			return input.legend.en;
		}
		return input.key;
	}

	function getChoiceLabel( choice ) {
		if ( choice.label && choice.label.ja ) {
			return choice.label.ja;
		}
		if ( choice.label && choice.label.en ) {
			return choice.label.en;
		}
		return String( choice.value );
	}

	function ParamControl( props ) {
		var input = props.input;
		var value = props.value;
		var onChange = props.onChange;
		var label = getInputLabel( input );

		if ( input.choices ) {
			return el( 'fieldset', { className: 'di-param__group di-param__radio' },
				el( 'legend', { className: 'di-param__label' }, label ),
				input.choices.map( function( choice, idx ) {
					var choiceId = input.key + '-' + idx;
					return el( 'label', { key: idx, className: 'di-param__choice', htmlFor: choiceId },
						el( 'input', {
							id: choiceId,
							type: 'radio',
							name: input.key,
							checked: value === choice.value,
							onChange: function() { onChange( choice.value ); }
						} ),
						el( 'span', {}, ' ' + getChoiceLabel( choice ) )
					);
				} )
			);
		}

		if ( input.min !== undefined && input.max !== undefined ) {
			var unit = input.unit && input.unit.ja ? input.unit.ja : ( input.unit && input.unit.en ? input.unit.en : '' );
			return el( 'div', { className: 'di-param__group di-param__range' },
				el( 'label', { className: 'di-param__label' }, label, ': ', value, unit ),
				el( 'input', {
					type: 'range',
					min: input.min,
					max: input.max,
					step: input.step || 1,
					value: value,
					onChange: function( e ) { onChange( parseFloat( e.target.value ) ); }
				} )
			);
		}

		return el( 'div', { className: 'di-param__group di-param__color' },
			el( 'label', { className: 'di-param__label' }, label ),
			el( 'input', {
				type: 'color',
				value: value,
				onChange: function( e ) { onChange( e.target.value ); }
			} )
		);
	}

	function LivePreview( props ) {
		var partId = props.partId;
		var params = props.params || {};
		var onParamsChange = props.onParamsChange;
		var onContentChange = props.onContentChange;

		var part = getPartById( partId );
		var inputs = part && part.inputs ? part.inputs : {};
		var allInputs = ( inputs.colors || [] ).concat( inputs.radios || [] ).concat( inputs.ranges || [] );

		var contentState = useState( null );
		var content = contentState[0];
		var setContent = contentState[1];
		var loadingState = useState( false );
		var loading = loadingState[0];
		var setLoading = loadingState[1];
		var errorState = useState( null );
		var errorVal = errorState[0];
		var setError = errorState[1];
		var retryState = useState( 0 );
		var retryNonce = retryState[0];
		var setRetry = retryState[1];

		useEffect( function() {
			if ( ! partId ) {
				setContent( null );
				setError( null );
				return;
			}
			setLoading( true );
			setError( null );

			if ( window.designInserterPartCodeFuncs && window.designInserterPartCodeFuncs[ partId ] ) {
				var computed = computePartContent( partId, params );
				setLoading( false );
				setContent( computed );
				return;
			}

			var controller = ( typeof AbortController === 'function' ) ? new AbortController() : null;
			fetchPartContent( partId, function( err, data ) {
				setLoading( false );
				if ( err ) {
					setError( err );
					return;
				}
				if ( data && data.id && data.id !== partId ) {
					return;
				}
				setContent( data );
			}, controller ? controller.signal : undefined );
			return function() {
				if ( controller ) { controller.abort(); }
			};
		}, [ partId, params, retryNonce ] );

		useEffect( function() {
			if ( onContentChange && content ) {
				onContentChange( content );
			}
		}, [ content ] );

		function updateParam( key, value ) {
			if ( ! onParamsChange ) {
				return;
			}
			var next = Object.assign( {}, params );
			next[ key ] = value;
			onParamsChange( next );
		}

		if ( errorVal ) {
			var label = errorVal.status
				? __( 'プレビュー取得に失敗しました', 'designinserter' ) + ' (HTTP ' + errorVal.status + ')'
				: __( 'プレビュー取得に失敗しました (ネットワーク or サーバ応答なし)', 'designinserter' );
			return el( Notice, { status: 'error', isDismissible: false },
				el( 'div', {},
					el( 'p', { style: { margin: '0 0 8px 0' } }, label ),
					el( Button, {
						variant: 'secondary',
						size: 'small',
						onClick: function() { setRetry( retryNonce + 1 ); }
					}, '再試行' )
				)
			);
		}

		if ( loading && ! content ) {
			return el( 'div', { className: 'di-preview di-preview--loading' }, el( Spinner ) );
		}

		if ( ! content ) {
			return el( Notice, { status: 'info', isDismissible: false }, '左の「探す」エリアでデザインを選んでください' );
		}

		var srcdoc = [
			'<!doctype html><html><head><meta charset="utf-8">',
			'<style>html,body{margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:8px;}',
			content.css || '',
			'</style></head><body>',
			content.html || '',
			'</body></html>'
		].join( '' );

		var wrapperClass = 'di-preview' + ( loading ? ' di-preview--refreshing' : '' );
		var hasParams = allInputs.length > 0;

		return el( 'div', { className: 'di-selection' },
			el( 'div', { className: 'di-selection__guide' },
				el( 'strong', {}, '選ぶ / 調整' ),
				el( 'span', {}, ' 選択中のデザインをここで確認します。' )
			),
			el( 'div', { className: wrapperClass, 'aria-busy': loading ? 'true' : 'false' },
				el( 'iframe', {
					className: 'di-preview__iframe',
					title: __( 'パーツプレビュー', 'designinserter' ),
					sandbox: '',
					srcDoc: srcdoc,
					style: { width: '100%', minHeight: '120px', border: 0, display: 'block' }
				} ),
				loading ? el( 'div', { className: 'di-preview__overlay' }, el( Spinner ) ) : null
			),
			hasParams
				? el( 'div', { className: 'di-params' },
					el( 'p', { className: 'di-params__title' }, 'パラメータ調整' ),
					allInputs.map( function( input ) {
						return el( ParamControl, {
							key: input.key,
							input: input,
							value: params[ input.key ] !== undefined ? params[ input.key ] : input.defaultValue,
							onChange: function( value ) { updateParam( input.key, value ); }
						} );
					} )
				  )
				: null
		);
	}

	function TemplatePreview( props ) {
		var template = props.template;
		var previewUrl = template.demoUrl || '';

		return el( 'div', { className: 'di-preview di-preview--template' },
			el( 'p', { className: 'di-preview__template-title' }, template.title ),
			previewUrl
				? el( 'iframe', {
					className: 'di-preview__iframe',
					title: 'テンプレプレビュー: ' + template.title,
					src: previewUrl,
					sandbox: 'allow-scripts allow-same-origin',
					style: { width: '100%', height: '480px', border: 0, display: 'block', borderRadius: '4px' }
				} )
				: el( 'p', { style: { color: '#757575', fontSize: '13px', margin: 0 } }, 'プレビューURLがありません' )
		);
	}

	function computePostConfirmTarget( editorSelect ) {
		if ( ! editorSelect ) {
			return null;
		}

		var currentPost = editorSelect.getCurrentPost ? editorSelect.getCurrentPost() : null;
		var status = editorSelect.getEditedPostAttribute
			? editorSelect.getEditedPostAttribute( 'status' )
			: ( currentPost && currentPost.status ? currentPost.status : '' );
		var permalink = editorSelect.getPermalink ? editorSelect.getPermalink() : '';
		var postLink = currentPost && currentPost.link ? currentPost.link : '';
		var editedLink = editorSelect.getEditedPostAttribute
			? editorSelect.getEditedPostAttribute( 'link' )
			: '';
		var previewLink = editorSelect.getEditedPostPreviewLink
			? editorSelect.getEditedPostPreviewLink()
			: '';

		if ( status === 'publish' && ( permalink || postLink ) ) {
			return {
				url: permalink || postLink,
				label: __( '公開ページで確認', 'designinserter' ),
				message: __( '素材を入れました。公開ページで見た目を確認してください。', 'designinserter' )
			};
		}

		if ( editedLink || previewLink || permalink || postLink ) {
			return {
				url: editedLink || previewLink || permalink || postLink,
				label: __( 'プレビューで確認', 'designinserter' ),
				message: __( '素材を入れました。プレビューで見た目を確認してください。', 'designinserter' )
			};
		}

		return null;
	}

	function InsertConfirmNotice( props ) {
		var insertedKey = props.insertedKey;
		var noticeRef = useRef( null );
		var target = useSelect
			? useSelect( function( select ) {
				return computePostConfirmTarget( select( 'core/editor' ) );
			}, [] )
			: computePostConfirmTarget(
				window.wp && window.wp.data && window.wp.data.select
					? window.wp.data.select( 'core/editor' )
					: null
			);

		useEffect( function() {
			if ( insertedKey && noticeRef.current ) {
				noticeRef.current.focus();
			}
		}, [ insertedKey ] );

		if ( ! insertedKey ) {
			return null;
		}

		return el( 'div', {
			className: 'di-insert-confirm',
			ref: noticeRef,
			tabIndex: '-1'
		},
			el( Notice, { status: 'success', isDismissible: false },
				el( 'p', { className: 'di-insert-confirm__message' }, target ? target.message : __( '素材を入れました。', 'designinserter' ) ),
				el( 'p', { className: 'di-insert-confirm__guidance' }, __( 'エディターと公開ページでは表示が変わる場合があります。', 'designinserter' ) ),
				target ? el( Button, {
					variant: 'secondary',
					size: 'small',
					href: target.url,
					target: '_blank',
					rel: 'noopener'
				}, target.label ) : null
			)
		);
	}

	function CreatePageButton( props ) {
		var template = props.template;
		var creatingState = useState( false );
		var creating = creatingState[0];
		var setCreating = creatingState[1];
		var resultState = useState( null );
		var result = resultState[0];
		var setResult = resultState[1];
		var errorState = useState( null );
		var error = errorState[0];
		var setError = errorState[1];

		if ( result ) {
			return el( 'div', { className: 'di-create-page-result' },
				el( Notice, { status: 'success', isDismissible: false }, '固定ページを作成しました' ),
				el( Button, {
					variant: 'primary',
					href: result.edit_url,
					target: '_blank',
					style: { marginTop: '8px' }
				}, 'ページを編集する →' )
			);
		}

		return el( 'div', { className: 'di-create-page' },
			error ? el( Notice, { status: 'error', isDismissible: false, style: { marginBottom: '8px' } }, error ) : null,
			el( Button, {
				variant: 'primary',
				isBusy: creating,
				disabled: creating,
				onClick: function() {
					setCreating( true );
					setError( null );
					window.fetch( templatesRestUrl + encodeURIComponent( template.id ) + '/create-page', {
						method: 'POST',
						headers: { 'X-WP-Nonce': nonce, 'Content-Type': 'application/json' }
					} )
						.then( function( res ) {
							if ( ! res.ok ) { throw new Error( 'HTTP ' + res.status ); }
							return res.json();
						} )
						.then( function( data ) { setCreating( false ); setResult( data ); } )
						.catch( function( err ) {
							setCreating( false );
							setError( 'ページ作成に失敗しました: ' + err.message );
						} );
				}
			}, 'このテンプレで固定ページを作成' )
		);
	}

	function partDefaultContent( part ) {
		if ( ! part ) {
			return { html: '', css: '' };
		}
		return {
			html: part.html || '',
			css: part.css || ''
		};
	}

	blocks.registerBlockType( 'designinserter/css-part', {
		title: 'Design Inserter',
		description: 'CSSデザインパーツを挿入',
		icon: 'art',
		category: 'design',
		keywords: [ 'css', 'design', 'parts', 'heading', 'button', 'box' ],
		attributes: {
			partId: { type: 'string', default: '' },
			params: { type: 'object', default: {} },
			html: { type: 'string', default: '' },
			css: { type: 'string', default: '' }
		},
		edit: function( props ) {
			var partId = props.attributes.partId || '';
			var params = props.attributes.params || {};
			var htmlAttr = props.attributes.html || '';
			var cssAttr = props.attributes.css || '';
			var selectedTemplateState = useState( null );
			var selectedTemplate = selectedTemplateState[0];
			var setSelectedTemplate = selectedTemplateState[1];
			var insertedKeyState = useState( '' );
			var insertedKey = insertedKeyState[0];
			var setInsertedKey = insertedKeyState[1];
			var part = getPartById( partId );

			useEffect( function() {
				if ( ! part ) {
					return;
				}
				var defaults = getDefaultParams( part.inputs );
				var defaultsContent = computePartContent( part.id, defaults ) || partDefaultContent( part );
				var next = { params: defaults, html: defaultsContent.html, css: defaultsContent.css };
				if ( JSON.stringify( params ) !== JSON.stringify( defaults ) || htmlAttr !== next.html || cssAttr !== next.css ) {
					props.setAttributes( next );
				}
			}, [ partId ] );

			function onSelectPart( selectedPart ) {
				props.setAttributes( {
					partId: selectedPart.id,
					params: {},
					html: '',
					css: ''
				} );
				setSelectedTemplate( null );
				setInsertedKey( 'part:' + selectedPart.id + ':' + Date.now() );
			}

			function onParamsChange( nextParams ) {
				props.setAttributes( { params: nextParams } );
			}

			function onContentChange( content ) {
				if ( content && ( content.html !== htmlAttr || content.css !== cssAttr ) ) {
					props.setAttributes( { html: content.html || '', css: content.css || '' } );
				}
			}

			var mergedParams = part ? Object.assign( {}, getDefaultParams( part.inputs ), params ) : params;

			return el( Fragment, {},
				el( InspectorControls, {},
					el( PanelBody, { title: 'Design Inserter', initialOpen: true },
						el( ItemPicker, {
							currentPartId: partId,
							currentTemplateId: selectedTemplate ? selectedTemplate.id : '',
							onSelectPart: onSelectPart,
							onSelectTemplate: function( tmpl ) {
								setSelectedTemplate( tmpl );
								props.setAttributes( { partId: '', params: {}, html: '', css: '' } );
								setInsertedKey( 'template:' + tmpl.id + ':' + Date.now() );
							}
						} )
					)
				),
				el( InsertConfirmNotice, { insertedKey: insertedKey } ),
				selectedTemplate
					? el( Fragment, {},
						el( TemplatePreview, { template: selectedTemplate } ),
						el( CreatePageButton, { template: selectedTemplate } )
					  )
					: el( LivePreview, {
						partId: partId,
						params: mergedParams,
						onParamsChange: onParamsChange,
						onContentChange: onContentChange
					} )
			);
		},
		save: function() { return null; }
	} );
} )(
	window.wp.blocks,
	window.wp.element,
	window.wp.blockEditor,
	window.wp.components,
	window.wp.i18n,
	window.wp.data
);
