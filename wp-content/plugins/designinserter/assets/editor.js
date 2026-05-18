( function( blocks, element, blockEditor, components, i18n ) {
	var el = element.createElement;
	var useState = element.useState;
	var useEffect = element.useEffect;
	var Fragment = element.Fragment;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var Button = components.Button;
	var Spinner = components.Spinner;
	var Notice = components.Notice;
	var __ = i18n.__;
	var catalog = window.DesignInserterCatalog || {};
	var parts = catalog.parts || [];
	var restUrl = catalog.restUrl || '';
	var nonce = catalog.nonce || '';

	var categories = [];
	var catSet = {};
	parts.forEach( function( part ) {
		if ( ! catSet[ part.categoryLabel ] ) {
			catSet[ part.categoryLabel ] = true;
			categories.push( part.categoryLabel );
		}
	} );

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
				: el( 'div', { className: 'di-card__placeholder', 'aria-hidden': 'true' }, '🎨' ),
			el( 'span', { className: 'di-card__title', 'aria-hidden': 'true' }, part.title )
		);
	}

	function PartPicker( props ) {
		var onSelect = props.onSelect;
		var currentId = props.currentId;
		var searchState = useState( '' );
		var search = searchState[0];
		var setSearch = searchState[1];
		var catState = useState( '' );
		var activeCat = catState[0];
		var setActiveCat = catState[1];

		var filtered = parts.filter( function( part ) {
			if ( activeCat && part.categoryLabel !== activeCat ) return false;
			if ( search ) {
				var q = search.toLowerCase();
				return part.title.toLowerCase().indexOf( q ) !== -1 ||
					part.categoryLabel.toLowerCase().indexOf( q ) !== -1 ||
					part.id.toLowerCase().indexOf( q ) !== -1;
			}
			return true;
		} );

		var hasActiveFilter = search !== '' || activeCat !== '';
		var clearFilters = function() { setSearch( '' ); setActiveCat( '' ); };

		return el( 'div', { className: 'di-picker' },
			el( TextControl, {
				placeholder: __( 'パーツを検索...', 'designinserter' ),
				value: search,
				onChange: setSearch,
				className: 'di-picker__search'
			} ),
			el( 'div', { className: 'di-picker__cats', role: 'group', 'aria-label': __( 'カテゴリ', 'designinserter' ) },
				el( Button, {
					variant: activeCat === '' ? 'primary' : 'tertiary',
					size: 'small',
					'aria-pressed': activeCat === '' ? 'true' : 'false',
					'aria-label': __( '全て', 'designinserter' ) + '、' + parts.length + ' 件',
					onClick: function() { setActiveCat( '' ); }
				}, __( '全て', 'designinserter' ), ' ', el( 'span', { 'aria-hidden': 'true' }, '(' + parts.length + ')' ) ),
				categories.map( function( cat ) {
					var count = parts.filter( function( p ) { return p.categoryLabel === cat; } ).length;
					return el( Button, {
						key: cat,
						variant: activeCat === cat ? 'primary' : 'tertiary',
						size: 'small',
						'aria-pressed': activeCat === cat ? 'true' : 'false',
						'aria-label': cat + '、' + count + ' 件',
						onClick: function() { setActiveCat( cat ); }
					}, cat, ' ', el( 'span', { 'aria-hidden': 'true' }, '(' + count + ')' ) );
				} )
			),
			el( 'div', { className: 'di-picker__grid', role: 'list' },
				filtered.map( function( part ) {
					return el( PartCard, {
						key: part.id,
						part: part,
						isSelected: part.id === currentId,
						onClick: function() { onSelect( part.id ); }
					} );
				} )
			),
			filtered.length === 0
				? el( 'div', { className: 'di-picker__empty' },
					el( 'p', {}, __( '該当するパーツがありません', 'designinserter' ) ),
					hasActiveFilter
						? el( Button, {
							variant: 'secondary',
							size: 'small',
							onClick: clearFilters
						}, __( '検索 / カテゴリをクリア', 'designinserter' ) )
						: null
				)
				: null
		);
	}

	function LivePreview( props ) {
		var partId = props.partId;
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
			var controller = ( typeof AbortController === 'function' ) ? new AbortController() : null;
			setLoading( true );
			setError( null );
			fetchPartContent( partId, function( err, data ) {
				setLoading( false );
				if ( err ) {
					setError( err );
					return;
				}
				if ( data && data.id && data.id !== partId ) {
					// Race guard: stale response for a previous partId — ignore.
					return;
				}
				setContent( data );
			}, controller ? controller.signal : undefined );
			return function() {
				if ( controller ) { controller.abort(); }
			};
		}, [ partId, retryNonce ] );

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
					}, __( '再試行', 'designinserter' ) )
				)
			);
		}

		if ( loading && ! content ) {
			// H-12: skeleton fallback when no prior content (first load).
			return el( 'div', { className: 'di-preview di-preview--loading' }, el( Spinner ) );
		}

		if ( ! content ) {
			return el(
				Notice,
				{ status: 'info', isDismissible: false },
				__( 'サイドバーからデザインパーツを選択してください', 'designinserter' )
			);
		}

		// C-02: render in sandboxed iframe to isolate untrusted/tampered
		// catalog HTML from the editor context. Sandbox attribute with
		// empty value disables scripts/forms/popups/plugins/top-nav.
		// 'allow-same-origin' is intentionally NOT granted — keeps the
		// iframe in a unique opaque origin.
		// H-12 (merged from PR #15): aria-busy + overlay during refresh
		// so the prior preview stays visible while iframe reloads.
		var srcdoc = [
			'<!doctype html><html><head><meta charset="utf-8">',
			'<style>html,body{margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:8px;}',
			content.css || '',
			'</style></head><body>',
			content.html || '',
			'</body></html>'
		].join( '' );

		var wrapperClass = 'di-preview' + ( loading ? ' di-preview--refreshing' : '' );
		return el( 'div', { className: wrapperClass, 'aria-busy': loading ? 'true' : 'false' },
			el( 'iframe', {
				className: 'di-preview__iframe',
				title: __( 'パーツプレビュー', 'designinserter' ),
				sandbox: '',
				srcDoc: srcdoc,
				style: { width: '100%', minHeight: '120px', border: 0, display: 'block' }
			} ),
			loading ? el( 'div', { className: 'di-preview__overlay' }, el( Spinner ) ) : null
		);
	}

	blocks.registerBlockType( 'designinserter/css-part', {
		title: 'Design Inserter',
		description: __( 'CSSデザインパーツを挿入', 'designinserter' ),
		icon: 'art',
		category: 'design',
		keywords: [ 'css', 'design', 'parts', 'heading', 'button', 'box' ],
		attributes: {
			partId: {
				type: 'string',
				default: ''
			}
		},
		edit: function( props ) {
			var partId = props.attributes.partId || '';

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: 'Design Inserter', initialOpen: true },
						el( PartPicker, {
							currentId: partId,
							onSelect: function( value ) {
								props.setAttributes( { partId: value } );
							}
						} )
					)
				),
				el( LivePreview, { partId: partId } )
			);
		},
		save: function() {
			return null;
		}
	} );
} )(
	window.wp.blocks,
	window.wp.element,
	window.wp.blockEditor,
	window.wp.components,
	window.wp.i18n
);
