( function( blocks, element, blockEditor, components, i18n ) {
	var el = element.createElement;
	var useState = element.useState;
	var Fragment = element.Fragment;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var Button = components.Button;
	var ButtonGroup = components.ButtonGroup;
	var Notice = components.Notice;
	var __ = i18n.__;
	var catalog = window.DesignInserterCatalog || {};
	var parts = catalog.parts || [];

	var categories = [];
	var catSet = {};
	parts.forEach( function( part ) {
		if ( ! catSet[ part.categoryLabel ] ) {
			catSet[ part.categoryLabel ] = true;
			categories.push( part.categoryLabel );
		}
	} );

	function getPart( partId ) {
		return parts.find( function( part ) {
			return part.id === partId;
		} );
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

		return el( 'div', { className: 'designinserter-picker' },
			el( TextControl, {
				placeholder: __( 'パーツを検索...', 'designinserter' ),
				value: search,
				onChange: setSearch,
				className: 'designinserter-picker__search'
			} ),
			el( 'div', { className: 'designinserter-picker__cats' },
				el( Button, {
					variant: activeCat === '' ? 'primary' : 'secondary',
					size: 'small',
					onClick: function() { setActiveCat( '' ); }
				}, __( '全て', 'designinserter' ) ),
				categories.map( function( cat ) {
					return el( Button, {
						key: cat,
						variant: activeCat === cat ? 'primary' : 'secondary',
						size: 'small',
						onClick: function() { setActiveCat( cat ); }
					}, cat );
				} )
			),
			el( 'div', { className: 'designinserter-picker__count' },
				filtered.length + ' / ' + parts.length + ' 件'
			),
			el( 'div', { className: 'designinserter-picker__list' },
				filtered.slice( 0, 30 ).map( function( part ) {
					var isSelected = part.id === currentId;
					return el( 'button', {
						key: part.id,
						type: 'button',
						className: 'designinserter-picker__item' + ( isSelected ? ' is-selected' : '' ),
						onClick: function() { onSelect( part.id ); }
					},
						el( 'span', { className: 'designinserter-picker__item-cat' }, part.categoryLabel ),
						el( 'span', { className: 'designinserter-picker__item-title' }, part.title )
					);
				} ),
				filtered.length > 30
					? el( 'p', { className: 'designinserter-picker__more' },
						'... 他 ' + ( filtered.length - 30 ) + ' 件（検索で絞り込んでください）'
					)
					: null
			)
		);
	}

	blocks.registerBlockType( 'designinserter/css-part', {
		title: 'Design Inserter',
		icon: 'insert',
		category: 'widgets',
		attributes: {
			partId: {
				type: 'string',
				default: ''
			}
		},
		edit: function( props ) {
			var partId = props.attributes.partId || '';
			var part = getPart( partId );

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
				part
					? el(
						'div',
						{ className: 'designinserter-editor-preview' },
						part.css ? el( 'style', {}, part.css ) : null,
						el( 'div', {
							className: 'designinserter-part',
							dangerouslySetInnerHTML: { __html: part.html }
						} )
					)
					: el(
						Notice,
						{ status: 'info', isDismissible: false },
						__( 'サイドバーからCSSパーツを選択してください。', 'designinserter' )
					)
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
