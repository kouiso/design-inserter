(function($){
  'use strict';

  $(function(){
    var $container = $('#muashi-product-pdf-meta');
    if (!$container.length || typeof wp === 'undefined' || !wp.media) {
      return;
    }

    var frame;
    var $idInput = $('#muashi_product_pdf_attachment_id');
    var $urlInput = $('#muashi_product_pdf_url_display');
    var $externalUrlInput = $('#muashi_product_pdf_external_url');
    var $selectButton = $container.find('.muashi-product-pdf-select');
    var $clearButton = $container.find('.muashi-product-pdf-clear');
    var $mediaSection = $('#muashi-pdf-media-section');
    var $externalSection = $('#muashi-pdf-external-section');
    var $sourceTypeRadios = $('input[name="muashi_pdf_source_type"]');

    // ラジオボタンの切り替え
    $sourceTypeRadios.on('change', function(){
      var sourceType = $(this).val();
      if (sourceType === 'media') {
        $mediaSection.show();
        $externalSection.hide();
        $externalUrlInput.val('');
      } else {
        $mediaSection.hide();
        $externalSection.show();
        $idInput.val('');
        $urlInput.val('');
      }
    });

    $selectButton.on('click', function(event){
      event.preventDefault();

      if (frame) {
        frame.open();
        return;
      }

      frame = wp.media({
        title: '資料PDFを選択',
        library: {
          type: ['application/pdf']
        },
        button: {
          text: '選択する'
        },
        multiple: false
      });

      frame.on('select', function(){
        var attachment = frame.state().get('selection').first();
        if (!attachment) {
          return;
        }
        var data = attachment.toJSON();
        $idInput.val(data.id || '');
        $urlInput.val(data.url || '');
      });

      frame.open();
    });

    $clearButton.on('click', function(event){
      event.preventDefault();
      $idInput.val('');
      $urlInput.val('');
    });
  });
})(jQuery);
