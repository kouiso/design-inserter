( function( blocks, element, blockEditor, components, i18n, data ) {
	var el = element.createElement;
	var useState = element.useState;
	var useEffect = element.useEffect;
	var Fragment = element.Fragment;
	var useRef = element.useRef;
	// wp.data.useSelect でエディター状態を購読し、ステータスやプレビューリンクの変化に追従させる
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
				: el( 'div', { className: 'di-card__placeholder', 'aria-hidden': 'true' }, '🖼️' ),
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
			sources.length > 0
				? el( 'div', { className: 'di-picker__sources', role: 'group', 'aria-label': 'Source filter' },
					sources.map( function( src ) {
						return el( Button, {
							key: src.id,
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
						onClick: function() { onSelectPart( part.id ); }
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
					}, '再試行' )
				)
			);
		}

		if ( loading && ! content ) {
			return el( 'div', { className: 'di-preview di-preview--loading' }, el( Spinner ) );
		}

		if ( ! content ) {
			return el( Notice, { status: 'info', isDismissible: false }, 'サイドバーからデザインパーツを選択してください' );
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
		// useSelect が使える環境ではエディター状態を購読して自動再描画。無ければ従来の一度きり読み取りにフォールバック。
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

	blocks.registerBlockType( 'designinserter/css-part', {
		title: 'Design Inserter',
		description: 'CSSデザインパーツを挿入',
		icon: 'art',
		category: 'design',
		keywords: [ 'css', 'design', 'parts', 'heading', 'button', 'box' ],
		attributes: {
			partId: { type: 'string', default: '' }
		},
		edit: function( props ) {
			var partId = props.attributes.partId || '';
			var selectedTemplateState = useState( null );
			var selectedTemplate = selectedTemplateState[0];
			var setSelectedTemplate = selectedTemplateState[1];
			var insertedKeyState = useState( '' );
			var insertedKey = insertedKeyState[0];
			var setInsertedKey = insertedKeyState[1];

			return el( Fragment, {},
				el( InspectorControls, {},
					el( PanelBody, { title: 'Design Inserter', initialOpen: true },
						el( ItemPicker, {
							currentPartId: partId,
							currentTemplateId: selectedTemplate ? selectedTemplate.id : '',
							onSelectPart: function( id ) {
								props.setAttributes( { partId: id } );
								setSelectedTemplate( null );
								setInsertedKey( 'part:' + id + ':' + Date.now() );
							},
							onSelectTemplate: function( tmpl ) {
								setSelectedTemplate( tmpl );
								props.setAttributes( { partId: '' } );
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
					: el( LivePreview, { partId: partId } )
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
