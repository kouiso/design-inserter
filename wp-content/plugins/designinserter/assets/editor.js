( function( blocks, element, blockEditor, components, i18n ) {
	var el = element.createElement;
	var Fragment = element.Fragment;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var SelectControl = components.SelectControl;
	var Notice = components.Notice;
	var __ = i18n.__;
	var catalog = window.DesignInserterCatalog || {};
	var parts = catalog.parts || [];

	function getPart( partId ) {
		return parts.find( function( part ) {
			return part.id === partId;
		} );
	}

	function getOptions() {
		var options = [
			{ label: __( 'パーツを選択', 'designinserter' ), value: '' }
		];

		parts.forEach( function( part ) {
			options.push( {
				label: '[' + part.categoryLabel + '] ' + part.title,
				value: part.id
			} );
		} );

		return options;
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
			var options = getOptions();

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: 'Design Inserter', initialOpen: true },
						el( SelectControl, {
							label: __( 'CSS パーツ', 'designinserter' ),
							value: partId,
							options: options,
							onChange: function( value ) {
								props.setAttributes( { partId: value } );
							}
						} )
					)
				),
				part
					? el(
						'div',
						{
							className: 'designinserter-editor-preview',
						},
						el( 'style', {}, part.css ),
						el( 'div', {
							className: 'designinserter-part',
							dangerouslySetInnerHTML: { __html: part.html }
						} )
					)
					: el(
						Notice,
						{ status: 'info', isDismissible: false },
						__( 'Design Inserter の CSS パーツを選択してください。', 'designinserter' )
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
