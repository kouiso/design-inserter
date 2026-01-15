<div class="contact__lead">
  <p>
    製品・サービス・採用に関するお問い合わせは、下記フォームより受け付けております。<br>
    お急ぎの方はお電話でも承ります。
  </p>
  <p class="contact__lead-tel">
    <span class="contact__lead-label">代表電話</span>
    <a class="contact__lead-number" href="tel:00-0000-0000">00-0000-0000</a>
    <span class="contact__lead-hours">（平日 9:00–18:00）</span>
  </p>
</div>

<div class="form__fields">

  <div class="form__field">
    <label class="form__label" for="contact-name">
      お名前 <span class="form__required">必須</span>
    </label>
    [text* your-name id:contact-name class:form__input placeholder "山田 太郎"]
  </div>

  <div class="form__field">
    <label class="form__label" for="contact-company">会社名</label>
    [text your-company id:contact-company class:form__input placeholder "株式会社○○"]
  </div>

  <div class="form__field">
    <label class="form__label" for="contact-email">
      メールアドレス <span class="form__required">必須</span>
    </label>
    [email* your-email id:contact-email class:form__input placeholder "example@example.com"]
  </div>

  <div class="form__field">
    <label class="form__label" for="contact-tel">お電話番号</label>
    [tel your-tel id:contact-tel class:form__input placeholder "09012345678"]
  </div>

  <div class="form__field form__field--full">
    <label class="form__label" for="contact-subject">
      件名 <span class="form__required">必須</span>
    </label>
    [text* your-subject id:contact-subject class:form__input placeholder "カタログダウンロードのご依頼"]
  </div>

  <div class="form__field form__field--full">
    <label class="form__label" for="contact-message">
      お問い合わせ内容 <span class="form__required">必須</span>
    </label>
    [textarea* your-message id:contact-message class:form__textarea placeholder "お問い合わせ内容をご記入ください"]
  </div>

  <!-- 資料選択情報（JSが書き込み） -->
  [hidden selected_products id:download-selected-products]
  [hidden source_product id:download-source-product]
  [hidden download_summary id:download-summary]

  <div class="form__field form__field--full">
    [acceptance agree class:form__checkbox]
      <a href="/privacy-policy/" target="_blank" rel="noopener">個人情報の取り扱い</a>に同意します
    [/acceptance]
  </div>

</div>

<div class="form__actions">
  [submit class:form__submit-button "送信する"]
</div>

<p class="form__note">※ 送信内容は当社のプライバシーポリシーに基づき取り扱います。</p>
