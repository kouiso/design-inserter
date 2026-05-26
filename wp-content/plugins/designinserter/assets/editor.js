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
	window.DesignInserterPreviewRequest = window.DesignInserterPreviewRequest || {
		id: 0,
		partId: ''
	};

	var categories = [];
	var catSet = {};
	parts.forEach( function( part ) {
		if ( ! catSet[ part.categoryLabel ] ) {
			catSet[ part.categoryLabel ] = true;
			categories.push( part.categoryLabel );
		}
	} );

	function fetchPartContent( partId, signal ) {
		return window.fetch( restUrl + partId, {
			headers: { 'X-WP-Nonce': nonce },
			signal: signal
		} )
			.then( function( res ) {
				if ( ! res.ok ) {
					throw new Error( 'Failed to load part.' );
				}
				return res.json();
			} );
	}

	function PartCard( props ) {
		var part = props.part;
		var isSelected = props.isSelected;
		var onClick = props.onClick;

		return el( 'button', {
			type: 'button',
			className: 'di-card' + ( isSelected ? ' is-selected' : '' ),
			onClick: onClick
		},
			part.previewImage
				? el( 'img', {
					className: 'di-card__img',
					src: part.previewImage,
					alt: part.title,
					loading: 'lazy'
				} )
				: el( 'div', { className: 'di-card__placeholder' }, part.title ),
			el( 'span', { className: 'di-card__title' }, part.title )
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

		return el( 'div', { className: 'di-picker' },
			el( TextControl, {
				placeholder: __( 'パーツを検索...', 'designinserter' ),
				value: search,
				onChange: setSearch,
				className: 'di-picker__search'
			} ),
			el( 'div', { className: 'di-picker__cats' },
				el( Button, {
					variant: activeCat === '' ? 'primary' : 'tertiary',
					size: 'small',
					onClick: function() { setActiveCat( '' ); }
				}, __( '全て', 'designinserter' ) + ' (' + parts.length + ')' ),
				categories.map( function( cat ) {
					var count = parts.filter( function( p ) { return p.categoryLabel === cat; } ).length;
					return el( Button, {
						key: cat,
						variant: activeCat === cat ? 'primary' : 'tertiary',
						size: 'small',
						onClick: function() { setActiveCat( cat ); }
					}, cat + ' (' + count + ')' );
				} )
			),
			el( 'div', { className: 'di-picker__grid' },
				filtered.slice( 0, 40 ).map( function( part ) {
					return el( PartCard, {
						key: part.id,
						part: part,
						isSelected: part.id === currentId,
						onClick: function() { onSelect( part.id ); }
					} );
				} )
			),
			filtered.length > 40
				? el( 'p', { className: 'di-picker__more' },
					'他 ' + ( filtered.length - 40 ) + ' 件（検索で絞り込んでください）'
				)
				: null,
			filtered.length === 0
				? el( 'p', { className: 'di-picker__empty' },
					__( '該当するパーツがありません', 'designinserter' )
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
		var errorState = useState( '' );
		var errorMessage = errorState[0];
		var setErrorMessage = errorState[1];
		var retryState = useState( 0 );
		var retryCount = retryState[0];
		var setRetryCount = retryState[1];

		useEffect( function() {
			var requestId = window.DesignInserterPreviewRequest.id + 1;
			var controller = window.AbortController ? new window.AbortController() : null;
			window.DesignInserterPreviewRequest = {
				id: requestId,
				partId: partId
			};

			if ( ! partId ) {
				setContent( null );
				setErrorMessage( '' );
				setLoading( false );
				return;
			}

			setLoading( true );
			setErrorMessage( '' );

			fetchPartContent( partId, controller ? controller.signal : undefined )
				.then( function( data ) {
					if (
						window.DesignInserterPreviewRequest.id !== requestId ||
						window.DesignInserterPreviewRequest.partId !== partId
					) {
						return;
					}
					setContent( data );
					setLoading( false );
				} )
				.catch( function( error ) {
					if ( error && error.name === 'AbortError' ) {
						return;
					}
					if (
						window.DesignInserterPreviewRequest.id !== requestId ||
						window.DesignInserterPreviewRequest.partId !== partId
					) {
						return;
					}
					setContent( null );
					setLoading( false );
					setErrorMessage( __( '選択した部品を読み込めませんでした。もう一度お試しください。', 'designinserter' ) );
				} );

			return function() {
				if ( controller ) {
					controller.abort();
				}
			};
		}, [ partId, retryCount ] );

		if ( loading ) {
			return el( 'div', { className: 'di-preview di-preview--loading' }, el( Spinner ) );
		}

		if ( ! content ) {
			return el(
				Notice,
				{ status: errorMessage ? 'error' : 'info', isDismissible: false },
				errorMessage || __( 'サイドバーからデザインパーツを選択してください', 'designinserter' ),
				errorMessage
					? el( Button, {
						variant: 'secondary',
						onClick: function() { setRetryCount( retryCount + 1 ); }
					}, __( '再試行', 'designinserter' ) )
					: null
			);
		}

		return el( 'div', { className: 'di-preview' },
			content.css ? el( 'style', {}, content.css ) : null,
			el( 'div', {
				className: 'di-preview__render',
				dangerouslySetInnerHTML: { __html: content.html }
			} )
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
