/**
 * 画像ブロックにスライダーコントロールを追加
 * 画像の幅を10px〜100%の範囲でスライダーで調整可能にする
 */
(function(wp) {
    const { addFilter } = wp.hooks;
    const { createHigherOrderComponent } = wp.compose;
    const { Fragment, createElement } = wp.element;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl } = wp.components;

    // 画像ブロックの属性を拡張
    function addImageSizeAttributes(settings, name) {
        if (name !== 'core/image') {
            return settings;
        }

        return Object.assign({}, settings, {
            attributes: Object.assign({}, settings.attributes, {
                customMaxWidth: {
                    type: 'number',
                    default: 0
                },
                customMaxWidthUnit: {
                    type: 'string',
                    default: 'px'
                }
            })
        });
    }

    // エディタにスライダーコントロールを追加
    const withImageSizeSlider = createHigherOrderComponent(function(BlockEdit) {
        return function(props) {
            if (props.name !== 'core/image') {
                return createElement(BlockEdit, props);
            }

            const { attributes, setAttributes } = props;
            const { customMaxWidth, customMaxWidthUnit } = attributes;

            // 単位に応じたスライダーの設定
            const sliderConfig = {
                px: { min: 50, max: 1200, step: 10, marks: [
                    { value: 300, label: '小' },
                    { value: 500, label: '中' },
                    { value: 800, label: '大' }
                ]},
                '%': { min: 10, max: 100, step: 5, marks: [] }
            };

            const config = sliderConfig[customMaxWidthUnit || 'px'];

            return createElement(
                Fragment,
                null,
                createElement(BlockEdit, props),
                createElement(
                    InspectorControls,
                    null,
                    createElement(
                        PanelBody,
                        {
                            title: '画像サイズ調整',
                            initialOpen: true
                        },
                        createElement(SelectControl, {
                            label: '単位',
                            value: customMaxWidthUnit || 'px',
                            options: [
                                { label: 'ピクセル (px)', value: 'px' },
                                { label: 'パーセント (%)', value: '%' }
                            ],
                            onChange: function(value) {
                                setAttributes({
                                    customMaxWidthUnit: value,
                                    customMaxWidth: 0 // 単位変更時にリセット
                                });
                            }
                        }),
                        createElement(RangeControl, {
                            label: '最大幅',
                            value: customMaxWidth || 0,
                            onChange: function(value) {
                                setAttributes({ customMaxWidth: value });
                            },
                            min: config.min,
                            max: config.max,
                            step: config.step,
                            allowReset: true,
                            resetFallbackValue: 0,
                            help: customMaxWidth > 0
                                ? '現在の設定: ' + customMaxWidth + (customMaxWidthUnit || 'px')
                                : '0 = 制限なし（元のサイズ）'
                        })
                    )
                )
            );
        };
    }, 'withImageSizeSlider');

    // エディタ内でのプレビュースタイル適用（BlockListBlockフィルター）
    const withImageSizePreview = createHigherOrderComponent(function(BlockListBlock) {
        return function(props) {
            if (props.name !== 'core/image') {
                return createElement(BlockListBlock, props);
            }

            const { attributes } = props;
            const { customMaxWidth, customMaxWidthUnit } = attributes;

            if (customMaxWidth && customMaxWidth > 0) {
                const unit = customMaxWidthUnit || 'px';
                const wrapperProps = Object.assign({}, props.wrapperProps, {
                    style: Object.assign({}, props.wrapperProps?.style, {
                        maxWidth: customMaxWidth + unit
                    })
                });
                return createElement(BlockListBlock, Object.assign({}, props, { wrapperProps: wrapperProps }));
            }

            return createElement(BlockListBlock, props);
        };
    }, 'withImageSizePreview');

    // フィルターを登録
    addFilter(
        'blocks.registerBlockType',
        'muashi/image-size-attributes',
        addImageSizeAttributes
    );

    addFilter(
        'editor.BlockEdit',
        'muashi/image-size-slider',
        withImageSizeSlider
    );

    addFilter(
        'editor.BlockListBlock',
        'muashi/image-size-preview',
        withImageSizePreview
    );

})(window.wp);
