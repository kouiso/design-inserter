(function(root){
  const _di_consts = {"COLOR":{"WHITE":"#ffffff","SILVER":"#f2f2f2","SILVER_DARK":"#d0d0d0","BLUE":"#2589d0","BLUE_LIGHT":"#e0efff","BLUE_LINK":"#4f96f6","ORANGE_LINK_HOVER":"#c7511f","BLACK":"#000000","BLACK_DARKMODE":"#16191f","BLACK_TEXT":"#333333","BLACK_TEXT_LIGHT":"#777777"},"BORDER_RADIUS":{"3PX":"3px","5PX":"5px","ELLIPSE":"25px","HALF":"50%"},"LIST_TYPE":{"decimal":"decimal","disc":"disc"},"TEMPLATE_TAGS":["カラー調整対応","レスポンシブ対応"],"LEGEND":{"BASE_COLOR":{"ja":"基調色","en":"Base color"},"TEXT_COLOR":{"ja":"文字色","en":"Text color"},"BG_COLOR":{"ja":"背景色","en":"Background color"},"BORDER_COLOR":{"ja":"枠線の色","en":"Border color"},"ICON_COLOR":{"ja":"アイコン色","en":"Icon color"}},"CHOICES":{"OFF":[{"label":{"ja":"なし","en":"OFF"},"value":false},{"label":{"ja":"あり","en":"ON"},"value":true}],"ON":[{"label":{"ja":"あり","en":"ON"},"value":true},{"label":{"ja":"なし","en":"OFF"},"value":false}]},"IMG":{"ICON":"","CATCH":""}};
  const _di_funcs = (function(){
  function c(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
  function m(t){return t.replace(/^#/,"")}function p(t,r){const[e,u,a]=c(t).map(n=>n+16*r<0?0:n+16*r>255?255:n+16*r);return f(e,u,a)}function f(t,r,e){return"#"+o(t)+o(r)+o(e)}function o(t){const r=t.toString(16);return r.length===1?"0"+r:r}

  return {a:p, r:m};
})();
  const _di_common_button = {"COMMON":{"RADIO":{"SHAPE":{"legend":{"ja":"ボタンの形状","en":"Button Shape"},"choices":[{"label":{"ja":"四角","en":"Square"},"value":"5px"},{"label":{"ja":"角丸","en":"Rounded corners"},"value":"25px"}]},"ARROW_ICON":{"legend":{"ja":"矢印アイコン","en":"Arrow icon"},"choices":[{"label":{"ja":"なし","en":"OFF"},"value":false},{"label":{"ja":"あり","en":"ON"},"value":true}]},"ICON_POSITION":{"legend":{"ja":"アイコンの位置","en":"Icon position"},"choices":[{"label":{"ja":"右","en":"Right"},"value":false},{"label":{"ja":"左","en":"Left"},"value":true}]},"ANIMATION_COUNT":{"legend":{"ja":"アニメーション","en":"Animation"},"choices":[{"label":{"ja":"永続","en":"Infinite"},"value":true},{"label":{"ja":"一度のみ","en":"once"},"value":false}]},"SPEECH_BUBBLE_BORDER":{"legend":{"ja":"吹き出しの枠線","en":"Speech bubble border"},"choices":[{"label":{"ja":"なし","en":"OFF"},"value":false},{"label":{"ja":"あり","en":"ON"},"value":true}]}}}};
  const _di_common_list = {"COMMON":{"RADIO":{"LIST_TYPE":{"legend":{"ja":"タグの種類","en":"Tag type"},"choices":[{"label":{"ja":"ul","en":"ul"},"value":"ul"},{"label":{"ja":"ol","en":"ol"},"value":"ol"}]},"BORDER_PRESENCE":{"legend":{"ja":"枠線","en":"Border"},"choices":[{"label":{"ja":"あり","en":"ON"},"value":true},{"label":{"ja":"なし","en":"OFF"},"value":false}]}}}};
  const _di_common_accordion = {"COMMON":{"RADIO":{"SHAPE":{"legend":{"ja":"形状","en":"Shape"},"choices":[{"label":{"ja":"四角","en":"Square"},"value":"5px"},{"label":{"ja":"角丸","en":"Rounded corners"},"value":"25px"}]},"ICON_TYPE":{"legend":{"ja":"アイコンの種類","en":"Icon type"},"choices":[{"label":{"ja":"矢印","en":"Arrow"},"value":true},{"label":{"ja":"プラスマイナス","en":"Plus or minus"},"value":false}]}}}};
  const _di_common_search_form = {"COMMON":{"RADIO":{"SHAPE":{"legend":{"ja":"フォームの形状","en":"Shape"},"choices":[{"label":{"ja":"四角","en":"Square"},"value":"3px"},{"label":{"ja":"角丸","en":"Rounded corners"},"value":"25px"}]}}}};
  const _di_common_radar_chart = {"RANGES_ITEM":{"defaultValue":7,"min":0,"max":10,"step":0.1,"unit":{"ja":"","en":""}}};
  const _di_common_read_more = {"COMMON":{"sentence":"「CSS Stock」はWeb制作の「これが欲しい」を叶える、をテーマにHTML・CSSのデザインやパーツをご紹介するサイトです。\n        お好きなパーツを選び、デザインや色を調整するだけ。あとはHTMLやCSSをコピペすれば、コーディング要らずでサイトに取り入れることができます。\n        ちなみにどのコードにおいても、自由にご自身のWebサイトやブログで使用いただいて構いません。もちろんオリジナルにカスタマイズしてご使用いただいても大丈夫です。"}};
  const _di_common_modal = {"COMMON":{"MODAL_CONTENT":"ここにモーダルの中身が入ります。ここにモーダルの中身が入ります。<br/>ここにモーダルの中身が入ります。ここにモーダルの中身が入ります。<br/>ここにモーダルの中身が入ります。ここにモーダルの中身が入ります。"}};
  const _di_functions_radar_chart = (function(){
  function a(s,l,i){const S=[];for(let t=i;t>0;t--)S.push(200*t/i);const r=[];for(const t of S){const e=[];for(let o=0;o<i;o++)e.push(g(i,t,o));r.push(e)}let E="";for(const t of r[0])E+=`            <path d="M ${200/2} ${200/2} L ${t.x} ${t.y}"/>
`;let f="";for(const t of r){let e="M ";for(let o=0;o<=t.length;o++){o!==0&&(e+=" L ");let $=t[o];o===t.length&&($=t[0]),e+=`${$.x} ${$.y}`}f+=`            <path d="${e}"/>
`}let n="M ",h="";for(let t=0;t<=i;t++){t!==0&&(n+=" L ");let e=g(i,l[t]/10*200,t);t!==i?h+=`            <circle cx="${e.x}" cy="${e.y}" r="3"/>
`:e=g(i,l[0]/10*200,0),n+=`${e.x} ${e.y}`}const I=`<path d="${n}" fill="${s}30" stroke="${s}"/>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 200 200">
        <g stroke="#dce5eb">
            ${E.trim()}
        </g>
        <g stroke="#dce5eb" fill="none">
            ${f.trim()}
        </g>
        ${I}
        <g fill="${s}">
            ${h.trim()}
        </g>
    </svg>`}
  function g(s,l,i){const S=(100+l/2*Math.sin(2*Math.PI/s*i)).toFixed(1),r=(200/2-l/2*Math.cos(2*Math.PI/s*i)).toFixed(1);return{x:S,y:r}}
  return {generateSvg:a};
})();
  const _di_functions_pie_chart = (function(){
  function i(t){return t<=25?e(25,25):t<=75?e(50,25):t<=99?e(75,50):e(50,50)}
  function e(t,n){return`top: ${t}%;
    right: ${n}%;`}
  return {getTextPositionStyle:i};
})();
  const _di_functions_bar_chart = (function(){
  function n(t){return t+10>100?100:t+10}
  function r(t){return t+20>100?100:t+20}
  return {get2ndText:n, get3rdText:r};
})();
  root.designInserterPartCodeFuncs = root.designInserterPartCodeFuncs || {};
  root.designInserterPartCodeFuncs['heading-1'] = (function(e){
    const d = {id:1,name:{ja:"左線",en:"Left line"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"左線の色",en:"Left line color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:'<h2 class="heading-1">CSS見出しデザイン</h2>',css:`.heading-1 {
    padding: .5em .7em;
    border-left: 5px solid ${t[0]};
    color: ${t[1]};
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-22'] = (function(e){
    const r = {id:22,name:{ja:"左線 & 背景色",en:"Left line & background color"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"左線の色",en:"Left line color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.SILVER},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:a}){return{html:'<h2 class="heading-22">CSS見出しデザイン</h2>',css:`.heading-22 {
    padding: .5em .7em;
    border-left: 5px solid ${a[0]};
    background-color: ${a[1]};
    color: ${a[2]};
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-23'] = (function(e, a){
    const m = {id:23,name:{ja:"左線 & 背景色 (立体的)",en:"Left line & background color (three dimensional)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"左線の色",en:"Left line color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.SILVER},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:o}){return{html:'<h2 class="heading-23">CSS見出しデザイン</h2>',css:`.heading-23 {
    padding: .5em .7em;
    border-left: 5px solid ${o[0]};
    border-bottom: 3px solid ${a(o[1],-2)};
    background-color: ${o[1]};
    color: ${o[2]};
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['heading-41'] = (function(e){
    const r = {id:41,name:{ja:"左線 & 背景色 (内側)",en:"Left line & background color (inner)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"左線の色",en:"Left line color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.SILVER},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:n}){return{html:'<h2 class="heading-41">CSS見出しデザイン</h2>',css:`.heading-41 {
    display: flex;
    align-items: center;
    padding: .5em .7em;
    background-color: ${n[1]};
    color: ${n[2]};
}

.heading-41::before {
    display: inline-block;
    width: 5px;
    height: 1.5em;
    margin-right: .5em;
    background-color: ${n[0]};
    content: '';
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-2'] = (function(e){
    const t = {id:2,name:{ja:"下線",en:"Underline"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.WHITE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:a}){return{html:'<h2 class="heading-2">CSS見出しデザイン</h2>',css:`.heading-2 {
    padding:0 .4em .2em;
    border-bottom: 3px solid ${a[0]};
    background-color: ${a[1]};
    color: ${a[2]};
}`}}};
    return function(params){ return t.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-33'] = (function(e){
    const l = {id:33,name:{ja:"文字数に応じて長さが変わる下線",en:"Underline whose length changes depending on the number of text"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:e.COLOR.BLUE},{legend:{ja:"下線の背景色",en:"Underline background color"},defaultValue:e.COLOR.SILVER},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:n}){return{html:`<h2 class="heading-33">
    <span>CSS見出しデザイン</span>
</h2>`,css:`.heading-33 {
    border-bottom: 3px solid ${n[1]};
}

.heading-33 span {
    display: inline-block;
    position: relative;
    padding: 0 .4em .2em;
    color: ${n[2]};
}

.heading-33 span::before {
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${n[0]};
    content: '';
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-3'] = (function(e){
    const l = {id:3,name:{ja:"下線 (点線)",en:"Underline (dotted)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.WHITE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:d}){return{html:'<h2 class="heading-3">CSS見出しデザイン</h2>',css:`.heading-3 {
    padding:0 .4em .2em;
    border-bottom: 3px dotted ${d[0]};
    background-color: ${d[1]};
    color: ${d[2]};
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-4'] = (function(e){
    const l = {id:4,name:{ja:"下線 (破線)",en:"Underline (dashed)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.WHITE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:d}){return{html:'<h2 class="heading-4">CSS見出しデザイン</h2>',css:`.heading-4 {
    padding:0 .4em .2em;
    border-bottom: 3px dashed ${d[0]};
    background-color: ${d[1]};
    color: ${d[2]};
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-5'] = (function(e){
    const t = {id:5,name:{ja:"下線 (二重線)",en:"Underline (double)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.WHITE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:d}){return{html:'<h2 class="heading-5">CSS見出しデザイン</h2>',css:`.heading-5 {
    padding:0 .4em .2em;
    border-bottom: 3px double ${d[0]};
    background-color: ${d[1]};
    color: ${d[2]};
}`}}};
    return function(params){ return t.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-21'] = (function(o){
    const d = {id:21,name:{ja:"吹き出し風 (下線のみ)",en:"Speech bubble style (underline only)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:o.COLOR.BLUE},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-21">CSS見出しデザイン</h2>',css:`.heading-21 {
    position: relative;
    padding: .5em .7em .4em;
    border-bottom: 3px solid ${e[0]};
    color: ${e[1]};
}

.heading-21::before,
.heading-21::after {
    position: absolute;
    left: 30px;
    bottom: -15px;
    width: 30px;
    height: 15px;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.heading-21::before {
    background-color: ${e[0]};
}

.heading-21::after {
    bottom: -11px;
    background-color: #fff;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-31'] = (function(t){
    const d = {id:31,name:{ja:"四角形の装飾",en:"Square decoration"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"四角形の色",en:"Square color"},defaultValue:t.COLOR.BLUE},{legend:t.LEGEND.TEXT_COLOR,defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-31">CSS見出しデザイン</h2>',css:`.heading-31 {
    position: relative;
    padding: .3em 0 .2em 1em;
    border-bottom: 3px solid ${e[0]};
    color: ${e[1]};
}

.heading-31::before {
    position: absolute;
    top: 0;
    left: .3em;
    transform: rotate(55deg);
    height: 11px;
    width: 12px;
    background: ${e[0]};
    content: '';
}

.heading-31::after {
    position: absolute;
    transform: rotate(15deg);
    top: .6em;
    left: 0;
    height: 8px;
    width: 8px;
    background: ${e[0]};
    content: '';
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-6'] = (function(e){
    const d = {id:6,name:{ja:"両端に線",en:"lines at both ends"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"線の色",en:"Line color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:i}){return{html:'<h2 class="heading-6">CSS見出しデザイン</h2>',css:`.heading-6 {
    display: inline-block;
    position: relative;
    padding: 0 2.5em;
    color: ${i[1]};
}

.heading-6::before,
.heading-6::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 50%;
    width: 45px;
    height: 3px;
    background-color: ${i[0]};
}

.heading-6::before {
    left: 0;
}

.heading-6::after {
    right: 0;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-7'] = (function(e){
    const r = {id:7,name:{ja:"下線 (小)",en:"Underline (small)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:o}){return{html:'<h2 class="heading-7">CSS見出しデザイン</h2>',css:`.heading-7 {
    display: inline-block;
    position: relative;
    color: #333;
}

.heading-7:before {
    content: '';
    display: inline-block;
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background-color: ${o[0]};
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-16'] = (function(e){
    const g = {id:16,name:{ja:"左右に斜線",en:"Diagonal lines left and right"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"線の色",en:"Line color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:'<h2 class="heading-16">CSS見出しデザイン</h2>',css:`.heading-16 {
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${t[1]};
}

.heading-16::before,
.heading-16::after {
    width: 3px;
    height: 40px;
    background-color: ${t[0]};
    content: '';
}

.heading-16::before {
    transform: rotate(-35deg);
    margin-right: 30px;
}

.heading-16::after {
    transform: rotate(35deg);
    margin-left: 30px;
}`}}};
    return function(params){ return g.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-36'] = (function(t){
    const n = {id:36,name:{ja:"鉤括弧",en:"Square bracket"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"括弧の色",en:"Bracket color"},defaultValue:t.COLOR.BLUE},{legend:t.LEGEND.TEXT_COLOR,defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-36">CSS見出しデザイン</h2>',css:`.heading-36 {
    position: relative;
    padding: .7em 1.3em;
    color: ${e[1]};
}

.heading-36::before,
.heading-36::after {
    display: inline-block;
    position: absolute;
    width: 1em;
    height: 1em;
    content: '';
}

.heading-36::before {
    top: 0;
    left: 0;
    border-top: 3px solid ${e[0]};
    border-left: 3px solid ${e[0]};
}

.heading-36::after {
    bottom: 0;
    right: 0;
    border-bottom: 3px solid ${e[0]};
    border-right: 3px solid ${e[0]};
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-37'] = (function(e){
    const d = {id:37,name:{ja:"鉤括弧 (大)",en:"Square bracket (large)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"括弧の色",en:"Bracket color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:o}){return{html:'<h2 class="heading-37">CSS見出しデザイン</h2>',css:`.heading-37 {
    position: relative;
    padding: .5em 1em;
    color: ${o[1]};
}

.heading-37::before,
.heading-37::after {
    display: inline-block;
    position: absolute;
    width: 10px;
    height: 100%;
    border: 3px solid ${o[0]};
    box-sizing: border-box;
    content: '';
}

.heading-37::before {
    top: 0;
    left: 0;
    border-right: none;
}

.heading-37::after {
    bottom: 0;
    right: 0;
    border-left: none;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-8'] = (function(i){
    const d = {id:8,name:{ja:"タグ風",en:"Tag style"},imgFormat:"svg",inputs:{colors:[{legend:i.LEGEND.BG_COLOR,defaultValue:i.COLOR.BLUE}]},codeFunc({colors:e}){return{html:'<h2 class="heading-8">CSS見出しデザイン</h2>',css:`.heading-8 {
    display: inline-block;
    position: relative;
    padding: .5em .7em;
    border-radius: 50px 0 0 50px;
    background-color: ${e[0]};
    color: #fff;
}

.heading-8::before {
    content: '';
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 13px;
    border-radius: 50%;
    background: #fff;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-9'] = (function(o){
    const n = {id:9,name:{ja:"吹き出し風",en:"Speech bubble style"},imgFormat:"svg",inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.BLUE}]},codeFunc({colors:e}){return{html:'<h2 class="heading-9">CSS見出しデザイン</h2>',css:`.heading-9 {
    position: relative;
    padding: .5em .7em;
    border-radius: 10px;
    background-color: ${e[0]};
    color: #fff;
}

.heading-9::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 30px;
    width: 0;
    height: 0;
    border: 11px solid transparent;
    border-top: 11px solid ${e[0]};
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-11'] = (function(t, e){
    const p = {id:11,name:{ja:"背景に回り込むリボン風",en:"Ribbon style wrapping around the background"},imgFormat:"svg",inputs:{colors:[{legend:t.LEGEND.BG_COLOR,defaultValue:t.COLOR.BLUE}]},codeFunc({colors:o}){return{html:'<h2 class="heading-11">CSS見出しデザイン</h2>',css:`.heading-11 {
    position: relative;
    padding: .5em .7em;
    background-color: ${o[0]};
    color: #fff;
}

.heading-11::before {
    position: absolute;
    top: 100%;
    left: 0;
    border-bottom: solid 10px transparent;
    border-right: solid 20px ${e(o[0],-1)};
    content: '';
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['heading-12'] = (function(o, t){
    const l = {id:12,name:{ja:"リボン風",en:"Ribbon style"},imgFormat:"svg",inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<h2 class="heading-12">
    <span>CSS見出しデザイン</span>
</h2>`,css:`.heading-12 {
    position: relative;
    width: 290px;
    margin: 0 auto;
    padding: .5em .7em;
    background-color: ${e[0]};
    color: #fff;
    text-align: center;
}

.heading-12::before,
.heading-12::after {
    position: absolute;
    bottom: -10px;
    z-index: -1;
    border-style: solid;
    border-color: ${t(e[0],-1)};
    content: '';
}

.heading-12::before {
    left: -30px;
    border-width: 25px 25px 25px 15px;
    border-left-color: transparent;
}

.heading-12::after {
    right: -30px;
    border-width: 25px 15px 25px 25px;
    border-right-color: transparent;
}

.heading-12 span::before,
.heading-12 span::after {
    position: absolute;
    bottom: -10px;
    width: 10px;
    height: 10px;
    background-color: ${t(e[0],-6)};
    content: '';
}

.heading-12 span::before {
    left: 0;
    clip-path: polygon(0 0, 100% 0%, 100% 100%);
}

.heading-12 span::after {
    right: 0;
    clip-path: polygon(0 0, 100% 0%, 0% 100%);
}
`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['heading-34'] = (function(e){
    const p = {id:34,name:{ja:"旗風",en:"Flag style"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.BLUE}]},codeFunc({colors:o}){return{html:`<h2 class="heading-34">
    <span>CSS見出しデザイン</span>
</h2>`,css:`.heading-34 {
    position: relative;
    margin: 0 0 25px 9px;
    padding: .5em .8em;
    background-color: ${o[0]};
    color: #fff;
}

.heading-34::before {
    position: absolute;
    top: 0;
    left: -9px;
    z-index: 1;
    width: 5px;
    height: 135%;
    border-radius: 3px;
    background-color: #600;
    content: '';
}

.heading-34 span::before,
.heading-34 span::after {
    position: absolute;
    left: -9px;
    width: 20px;
    height: 3px;
    border-radius: 3px;
    background-color: #c99;
    content: '';
}

.heading-34 span::before {
    top: 44%;
    transform: rotate(-25deg);
}

.heading-34 span::after {
    top: 54%;
    transform: rotate(25deg);
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-10'] = (function(e){
    const n = {id:10,name:{ja:"テープ風",en:"Tape style"},inputs:{colors:[{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:o}){return{html:'<h2 class="heading-10">CSS見出しデザイン</h2>',css:`.heading-10 {
    display: inline-block;
    position: relative;
    transform: rotate(-5deg);
    padding: .5em .7em;
    border-left: 2px dotted rgba(0, 0, 0, .1);
    border-right: 2px dotted rgba(0, 0, 0, .1);
    box-shadow: 0 0 5px rgba(0, 0, 0, .2);
    background-color: rgba(0, 0, 0, .01);
    color: ${o[0]};
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-14'] = (function(e){
    const d = {id:14,name:{ja:"付箋風 (単色)",en:"Sticky note style (monochromatic)"},inputs:{colors:[{legend:e.LEGEND.BG_COLOR,defaultValue:"#a9ceec"},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:o}){return{html:'<h2 class="heading-14">CSS見出しデザイン</h2>',css:`.heading-14 {
    display: inline-block;
    position: relative;
    padding: .5em 1.4em .5em 1em;
    background-color: ${o[0]};
    color: ${o[1]};
}

.heading-14::before {
    position: absolute;
    bottom: -1px;
    right: 9px;
    z-index: -1;
    transform: rotate(5deg);
    width: 70%;
    height: 50%;
    background-color: #d0d0d0;
    content: "";
    filter: blur(4px);
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-15'] = (function(e){
    const a = {id:15,name:{ja:"付箋風 (先端色)",en:"Sticky note style (tip color)"},inputs:{colors:[{legend:{ja:"先端色",en:"Tip color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:o}){return{html:'<h2 class="heading-15">CSS見出しデザイン</h2>',css:`.heading-15 {
    display: inline-block;
    position: relative;
    padding: .5em 1em;
    border-right: 27px solid ${o[0]};
    background-color: #f5f5f5;
    color: ${o[1]};
}

.heading-15::before {
    position: absolute;
    bottom: 2px;
    right: -20px;
    z-index: -1;
    transform: rotate(5deg);
    width: 100%;
    height: 50%;
    background-color: #d0d0d0;
    content: "";
    filter: blur(4px);
}`}}};
    return function(params){ return a.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-17'] = (function(e){
    const d = {id:17,name:{ja:"番号",en:"Number"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:`<h2 class="heading-17">
    <span>01</span>
    CSS見出しデザイン
</h2>`,css:`.heading-17 {
    display: flex;
    justify-content: start;
    align-items: center;
    position: relative;
    padding: .5em .7em;
    overflow: hidden;
    border: 2px solid ${t[0]};
    border-radius: 5px;
    color: ${t[1]};
}

.heading-17:before {
    position: absolute;
    top: -50%;
    left: -30px;
    z-index: -1;
    transform: rotate(25deg);
    width: 100px;
    height: 200%;
    background-color: ${t[0]};
    content: '';
}

.heading-17 span {
    margin-right: 1.1em;
    color: #fff;
    font-size: 1.1em
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-18'] = (function(e){
    const m = {id:18,name:{ja:"カラフルなシャドウ",en:"Colorful shadow"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}]},codeFunc({colors:o}){return{html:'<h2 class="heading-18">CSS見出しデザイン</h2>',css:`.heading-18 {
    padding: .5em .7em;
    border: 2px solid ${o[0]};
    box-shadow: 5px 5px ${o[0]};
    color: ${o[0]};
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-19'] = (function(t){
    const p = {id:19,name:{ja:"立体的",en:"Three dimensional"},imgFormat:"svg",inputs:{colors:[{legend:t.LEGEND.BASE_COLOR,defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-19">CSS見出しデザイン</h2>',css:`.heading-19 {
    position: relative;
    padding: .5em .7em;
    border: 3px solid ${e[0]};
    color: ${e[0]};
}

.heading-19::before,
.heading-19::after {
    position: absolute;
    border: solid ${e[0]};
    content: '';
}

.heading-19::before {
    top: 3px;
    right: -16px;
    transform: skewY(45deg);
    width: 10px;
    height: 100%;
    border-width: 4px 3px 3px 0;
}

.heading-19::after {
    bottom: -16px;
    left: 4px;
    transform: skewX(45deg);
    width: 100%;
    height: 10px;
    border-width: 0 2px 3px 4px;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-20'] = (function(a){
    const g = {id:20,name:{ja:"ストライプ背景",en:"Striped background"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"ストライプ色1",en:"Stripe color 1"},defaultValue:"#bbdbfb"},{legend:{ja:"ストライプ色2",en:"Stripe color 2"},defaultValue:"#f2f6fc"},{legend:a.LEGEND.TEXT_COLOR,defaultValue:a.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-20">CSS見出しデザイン</h2>',css:`.heading-20 {
    padding: .5em .7em;
    background-image: repeating-linear-gradient(-45deg, ${e[0]}, ${e[0]} 3px, ${e[1]} 3px, ${e[1]} 7px);
    color: ${e[2]};
}`}}};
    return function(params){ return g.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-40'] = (function(a){
    const p = {id:40,name:{ja:"チェック柄",en:"Plaid"},imgFormat:"svg",comment:{ja:"チェック柄を背景にした見出し。文字色を黒系統の色にするとせっかくの可愛らしいチェック柄が活かされないため、文字色はあえて基調色と同じものにしています。",en:"Headline on a checkered background. If the font color is black, the cute checkered pattern will not be taken advantage of, so I intentionally chose the font color to match the base color."},inputs:{colors:[{legend:a.LEGEND.BG_COLOR,defaultValue:"#5ba9f7"}],radios:[{legend:{ja:"枠線",en:"Border"},choices:a.CHOICES.ON}]},codeFunc({colors:e,radios:t}){return{html:'<h2 class="heading-40">CSS見出しデザイン</h2>',css:`.heading-40 {
    padding: .5em .7em;${t[0]?`
    border-top: 2px solid ${e[0]};
    border-bottom: 2px solid ${e[0]};`:""}
    background-image: linear-gradient(45deg, ${e[0]}12 25%, transparent 25%, transparent 50%, ${e[0]}12 50%, ${e[0]}12 75%, transparent 75%, transparent), linear-gradient(-45deg, ${e[0]}12 25%, transparent 25%, transparent 50%, ${e[0]}12 50%, ${e[0]}12 75%, transparent 75%, transparent);
    background-color: ${e[0]}0d;
    background-size: 20px 20px;
    color: ${e[0]};
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-32'] = (function(e){
    const n = {id:32,name:{ja:"映画フィルム風",en:"Movie film style"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.BLACK}]},codeFunc({colors:o}){return{html:'<h2 class="heading-32">CSS見出しデザイン</h2>',css:`.heading-32 {
    display: flex;
    align-items: center;
    position: relative;
    padding: 1.1em 1.4em 1.1em 1em;
    background-color: ${o[0]};
    color: #fff;
}

.heading-32::before {
    position: absolute;
    left: 5px;
    width: calc(100% - 10px);
    height: 65%;
    border-top: 10px dashed #fff;
    border-bottom: 10px dashed #fff;
    content: '';
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-28'] = (function(e){
    const r = {id:28,name:{ja:"大きいラベル",en:"Large label"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:'<h2 class="heading-28" data-label="CSS HEADING">CSS見出しデザイン</h2>',css:`.heading-28 {
    color: ${t[0]};
    font-weight: 400;
    font-size: .75rem;
    letter-spacing: .04em;
    text-align: center;
}

.heading-28::before {
    display: block;
    font-weight: 700;
    font-size: 1.65rem;
    line-height: 1.5;
    letter-spacing: .02em;
    content: attr(data-label);
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-13'] = (function(e){
    const n = {id:13,name:{ja:"下に反射する文字",en:"Letters reflected below"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:'<h2 class="heading-13">CSS見出しデザイン</h2>',css:`.heading-13 {
    position: relative;
    color: ${t[0]};
    -webkit-box-reflect: below -10px -webkit-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, .5));
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-26'] = (function(e){
    const n = {id:26,name:{ja:"1文字目だけ大きめ",en:"Only the 1st character is larger"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"1文字目の色",en:"1st text color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:'<h2 class="heading-26">CSS見出しデザイン</h2>',css:`.heading-26 {
    color: ${t[1]};
}

.heading-26:first-letter {
    color: ${t[0]};
    font-size: 2em;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-24'] = (function(t){
    const d = {id:24,name:{ja:"数字の背景",en:"Number background"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"数字の色",en:"Number color"},defaultValue:"#d9f4ff"},{legend:t.LEGEND.TEXT_COLOR,defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-24" data-number="01">CSS見出しデザイン</h2>',css:`.heading-24 {
    position: relative;
    padding-top: 1.5em;
    color: ${e[1]};
}

.heading-24::before {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: -1;
    color: ${e[0]};
    font-size: 3em;
    line-height: 1;
    content: attr(data-number);
    pointer-events: none;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-25'] = (function(t){
    const r = {id:25,name:{ja:"文字の背景",en:"Text background"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景文字の色",en:"background text color"},defaultValue:"#d9f4ff"},{legend:t.LEGEND.TEXT_COLOR,defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-25" data-word="HEADING">CSS見出しデザイン</h2>',css:`.heading-25 {
    position: relative;
    padding-top: .75em;
    color: ${e[1]};
}

.heading-25::before {
    position: absolute;
    bottom: .5em;
    left: 0;
    z-index: -1;
    color: ${e[0]};
    font-size: 1.5em;
    line-height: 1;
    content: attr(data-word);
    pointer-events: none;
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-29'] = (function(i){
    const c = {id:29,name:{ja:"円の背景",en:"Circle background"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"円の色",en:"Circle color"},defaultValue:"#bbdbfb"},{legend:i.LEGEND.TEXT_COLOR,defaultValue:i.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:'<h2 class="heading-29">CSS見出しデザイン</h2>',css:`.heading-29 {
    display: inline-block;
    position: relative;
    margin: calc(3.5em / 2) 0 calc(3.5em / 4) calc(3.5em / 2);
    color: ${e[1]};
    line-height: 1;
}

.heading-29::before {
    position: absolute;
    bottom: calc(-3.5em / 4);
    left: calc(-3.5em / 2);
    z-index: -1;
    width: 3.5em;
    height: 3.5em;
    border-radius: 50%;
    background: ${e[0]};
    content: '';
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-38'] = (function(e){
    const l = {id:38,name:{ja:"重なる2つの正方形",en:"Two overlapping squares"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"正方形の色",en:"Square color"},defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:a}){return{html:'<h2 class="heading-38">CSS見出しデザイン</h2>',css:`.heading-38 {
    position: relative;
    padding: .5em 1.2em;
    color: ${a[1]};
}

.heading-38::before,
.heading-38::after {
    display: inline-block;
    position: absolute;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border: 2px solid ${a[0]};
    content: '';
}

.heading-38::before {
    top: calc(50% - 3px);
    left: 0;
}

.heading-38::after {
    top: calc(50% + 3px);
    left: 5px;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-27'] = (function(e){
    const d = {id:27,name:{ja:"チェックアイコン",en:"Check icon"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.ICON_COLOR,defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:'<h2 class="heading-27">CSS見出しデザイン</h2>',css:`.heading-27 {
    display: flex;
    align-items: center;
    column-gap: 8px;
    color: ${t[1]};
}

.heading-27::before {
    width: 0.8em;
    height: 0.4em;
    border-bottom: 4px solid ${t[0]};
    border-left: 4px solid ${t[0]};
    transform: rotate(-45deg) translate(2px, -2px);
    content: '';
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['heading-35'] = (function(e, t){
    const d = {id:35,name:{ja:"冠アイコン",en:"Crown icon"},imgFormat:"svg",comment:{ja:"ランキングコンテンツなどで役立つ、冠のアイコンが付いた見出しです。2位は銀色、3位は銅色にするのも良いかもしれませんね。",en:"A heading with a crown icon that is useful for ranking content, etc. It might be a good idea to make the 2nd place silver and the 3rd place bronze."},inputs:{colors:[{legend:e.LEGEND.ICON_COLOR,defaultValue:"#ffb500"},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:a}){return{html:'<h2 class="heading-35">CSS見出しデザイン</h2>',css:`.heading-35 {
    display: flex;
    align-items: center;
    gap: 0 7px;
    color: ${a[1]};
}

.heading-35::before {
    width: 1.25em;
    height: 1.25em;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M2.00488 19H22.0049V21H2.00488V19ZM2.00488 5L7.00488 8L12.0049 2L17.0049 8L22.0049 5V17H2.00488V5Z' fill='%23${t(a[0])}'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['button-1'] = (function(e, r){
    const u = {id:1,name:{ja:"スタンダード",en:"Standard"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-1">ボタンデザイン</button>',css:`.button-1 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    border: 1px solid ${t[0]};
    border-radius: ${o[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}${o[1]?`

.button-1::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}`:""}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-54'] = (function(o, e){
    const u = {id:54,name:{ja:"細い矢印",en:"Thin arrow"},imgFormat:"svg",inputs:{colors:[{legend:o.LEGEND.BASE_COLOR,defaultValue:o.COLOR.BLUE}],radios:[e.RADIO.SHAPE]},codeFunc({colors:t,radios:r}){return{html:'<button class="button-54">ボタンデザイン</button>',css:`.button-54 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 3em .9em 2em;
    border: 1px solid ${t[0]};
    border-radius: ${r[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-54::after {
    position: absolute;
    right: 2em;
    transform: translateY(-50%);
    transform-origin: left;
    width: 2em;
    height: .5em;
    background-color: ${t[0]};
    clip-path: polygon(0 100%, 100% 100%, 70% 40%, 70% 90%, 0% 90%);
    content: '';
    transition: transform .3s;
}

.button-54:hover::after {
    transform: translateY(-50%) scaleX(1.4);
}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-45'] = (function(e){
    const u = {id:45,name:{ja:"交差する枠線",en:"Intersecting border"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}]},codeFunc({colors:t}){return{html:'<button class="button-45">ボタンデザイン</button>',css:`.button-45 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border-top: 1px solid ${t[0]};
    border-right: none;
    border-bottom: 1px solid ${t[0]};
    border-left: none;
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-45::before,
.button-45::after {
    position: absolute;
    width: 1px;
    height: 140%;
    background-color: ${t[0]};
    content: '';
}

.button-45::before {
    left: calc(3.1em / 5 - 1px);
}

.button-45::after {
    right: calc(3.1em / 5 - 1px);
}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['button-39'] = (function(e, n){
    const p = {id:39,name:{ja:"平行四辺形",en:"Parallelogram"},comment:{ja:"「skew」で傾斜を付けたボタン。テキストを真っ直ぐのままにするために、疑似要素に傾斜を付けています。",en:`A button with a slant with "skew". I'm slanting the pseudo-element to keep the text straight.`},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[n.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-39">ボタンデザイン</button>',css:`.button-39 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-39::before {
    position: absolute;
    transform: skewX(-25deg);
    width: 100%;
    height: 100%;
    border: 1px solid ${t[0]};
    content: '';
}${o[0]?`

.button-39::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}`:""}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-2'] = (function(r, e, n){
    const p = {id:2,name:{ja:"スタンダード",en:"Standard"},imgFormat:"svg",inputs:{colors:[{legend:r.LEGEND.BASE_COLOR,defaultValue:r.COLOR.BLUE}],radios:[e.RADIO.SHAPE,e.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-2">ボタンデザイン</button>',css:`.button-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${o[0]};
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}${o[1]?`

.button-2::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}

.button-2:hover {
    background-color: ${n(t[0],-1)};
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-3'] = (function(r, e, n){
    const u = {id:3,name:{ja:"シャドウ",en:"Shadow"},inputs:{colors:[{legend:r.LEGEND.BASE_COLOR,defaultValue:r.COLOR.BLUE}],radios:[e.RADIO.SHAPE,e.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-3">ボタンデザイン</button>',css:`.button-3 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${o[0]};
    box-shadow: 0 2px 3px rgb(0 0 0 / 25%), 0 2px 3px -2px rgb(0 0 0 / 15%);
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}${o[1]?`

.button-3::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}

.button-3:hover {
    background-color: ${n(t[0],-1)};
}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-4'] = (function(r, e, n){
    const l = {id:4,name:{ja:"立体的",en:"Three-dimensional"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-4">ボタンデザイン</button>',css:`.button-4 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    border: none;
    border-bottom: solid 5px ${n(t[0],-3)};
    border-radius: ${o[0]};
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
    transition: .5s ease;
}${o[1]?`

.button-4::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}

.button-4:hover {
    transform: translateY(3px);
    border-bottom-width: 2px;
}
`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_common_button.COMMON, _di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-49'] = (function(r, e){
    const m = {id:49,name:{ja:"内側に枠線",en:"Border inside"},imgFormat:"svg",inputs:{colors:[{legend:r.LEGEND.BASE_COLOR,defaultValue:r.COLOR.BLUE}],radios:[e.RADIO.SHAPE,e.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-49">ボタンデザイン</button>',css:`.button-49 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: 2px solid #fff;
    border-radius: ${o[0]};
    box-shadow: 0 0 0 3px ${t[0]};
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}${o[1]?`

.button-49::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-43'] = (function(o, n){
    const p = {id:43,name:{ja:"グラデーション (上下)",en:"Gradient (up and down)"},inputs:{colors:[{legend:o.LEGEND.BASE_COLOR,defaultValue:o.COLOR.BLUE}],radios:[n.RADIO.SHAPE,n.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:e}){return{html:'<button class="button-43">ボタンデザイン</button>',css:`.button-43 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${e[0]};
    background-image: linear-gradient(0deg, ${t[0]} 0%, ${t[0]}80 100%);
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}${e[1]?`

.button-43::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-50'] = (function(o, n){
    const m = {id:50,name:{ja:"星アイコンのリボン",en:"Star icon ribbon"},imgFormat:"svg",comment:{ja:"星アイコンをあしらったリボン付きのボタン。リボンの色が白なので、白背景にボタンを置く場合はシャドウを付けて立体的に見せるのがおすすめです。",en:"A button with a ribbon featuring a star icon. The color of the ribbon is white, so if you are placing a button on a white background, we recommend adding a shadow to make it look three-dimensional."},inputs:{colors:[{legend:o.LEGEND.BASE_COLOR,defaultValue:o.COLOR.BLUE}],radios:[n.RADIO.SHAPE,{legend:{ja:"シャドウ",en:"Shadow"},choices:o.CHOICES.ON}]},codeFunc({colors:t,radios:e}){return{html:'<button class="button-50">ボタンデザイン</button>',css:`.button-50 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em .8em 45px;
    border: none;
    border-radius: ${e[0]};${e[1]?`
    box-shadow: 0 2px 3px rgb(0 0 0 / 30%), 0 2px 3px -2px rgb(0 0 0 / 20%);`:""}
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
    transition: transform .3s ease-in-out, box-shadow .3s ease-in-out;
}

.button-50:hover {
    transform: translateY(-1px);
    box-shadow: 0 15px 30px -5px rgb(0 0 0 / 20%), 0 0 5px rgb(0 0 0 / 10%);
}

.button-50::before {
    position: absolute;
    top: 0;
    left: 15px;
    width: 30px;
    height: 85%;
    background-color: #fff;
    clip-path: polygon(0 0, 0 100%, 50% 75%, 100% 100%, 100% 0);
    content: '';
}

.button-50::after {
    position: absolute;
    top: 33%;
    left: 30px;
    transform: translate(-50%, -50%);
    color: ${t[0]};
    font-size: 1.2em;
    content: '★';
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-20'] = (function(e){
    const u = {id:20,name:{ja:"ページ上部へ戻る",en:"Scroll to top of page"},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.BG_COLOR,defaultValue:e.COLOR.BLUE},{legend:e.LEGEND.ICON_COLOR,defaultValue:e.COLOR.WHITE}],radios:[{legend:{ja:"ボタンの形状",en:"Shape"},choices:[{label:{ja:"円",en:"Circle"},value:e.BORDER_RADIUS.HALF},{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["5PX"]}]}]},codeFunc({colors:t,radios:o}){return{html:`<button class="button-20">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="${t[1]}" d="m12.9 5.1 10.7 10.7c.5.5.5 1.4 0 1.9l-1.2 1.2c-.5.5-1.3.5-1.9 0L12 10.4l-8.5 8.5c-.5.5-1.3.5-1.9 0L.4 17.7c-.5-.5-.5-1.4 0-1.9L11.1 5.1c.5-.5 1.3-.5 1.8 0z"/>
    </svg>
</button>`,css:`.button-20 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border: none;
    border-radius: ${o[0]};
    background-color: ${t[0]};
}

.button-20:hover {
    border: 1px solid ${t[0]};
    background-color: #fff;
}

.button-20:hover path {
    fill: ${t[0]};
}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['button-65'] = (function(e, n){
    const p = {id:65,name:{ja:"通知",en:"Notification"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"アイコンの色",en:"Icon color"},defaultValue:"#aaaaaa"},{legend:{ja:"件数の色",en:"Number color"},defaultValue:e.COLOR.BLUE}],radios:[{legend:e.LEGEND.BG_COLOR,choices:e.CHOICES.ON},{legend:{ja:"ボタンの形状",en:"Shape"},choices:[{label:{ja:"円",en:"Circle"},value:e.BORDER_RADIUS.HALF},{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["5PX"]}]},{legend:{ja:"件数",en:"Number"},choices:e.CHOICES.ON}]},codeFunc({colors:o,radios:t}){return{html:`<button class="button-65">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M22 20H2V18H3V11.0314C3 6.04348 7.02944 2 12 2C16.9706 2 21 6.04348 21 11.0314V18H22V20ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z"></path>
    </svg>${t[2]?`
    <span>2</span>`:""}
</button>`,css:`.button-65 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: ${t[1]};
    background-color: ${t[0]?n(o[0],4.5):"transparent"};
}

.button-65 svg {
    width: 25px;
    height: 25px;
    fill: ${o[0]};
}${t[2]?`

.button-65 span {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: -15%;
    right: -15%;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${o[1]};
    color: #fff;
    font-size: .9em;
}`:""}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-61'] = (function(t, n){
    const u = {id:61,name:{ja:"プラスアイコン",en:"Plus icon"},imgFormat:"svg",comment:{ja:"背景の円と共にプラスアイコンを付けてみました。背景の円は画像で、そしてアイコンはあえて疑似要素で表現することで「押下時に回転させてマイナスに変形させる」といった拡張も可能にしています。",en:'I added a plus icon along with a circle in the background. The background circle is an image, and the icon is intentionally expressed as a pseudo-element, making it possible to expand it by "rotating it and deforming it negatively when pressed."'},inputs:{colors:[{legend:t.LEGEND.BASE_COLOR,defaultValue:t.COLOR.BLUE}],radios:[n.RADIO.SHAPE]},codeFunc({colors:e,radios:o}){return{html:'<button class="button-61">ボタンデザイン</button>',css:`.button-61 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 3.2em .9em 2em;
    border: none;
    border-radius: ${o[0]};
    background-color: ${e[0]};
    background-image: url(data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2028%2028%22%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2214%22%20cy%3D%2214%22%20r%3D%2214%22%20style%3D%22fill%3A%23fff%3B%22%2F%3E%0A%3C%2Fsvg%3E);
    background-position: right 3em center;
    background-size: 1.2em;
    background-repeat: no-repeat;
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}

.button-61:hover {
    background-color: #1579c0;
}

.button-61::before,
.button-61::after {
    position: absolute;
    right: calc(3.6em - 1.5px);
    width: 3px;
    height: 10px;
    border-radius: 1px;
    background-color: ${e[0]};
    content: '';
}

.button-61::before {
    transform: rotate(90deg);
}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-55'] = (function(o, n, a){
    const c = {id:55,name:{ja:"外部リンクアイコン",en:"External link icon"},comment:{ja:"外部リンクのアイコンを付けたボタン。そのリンクが別タブで開くことを明示しておきたい場合におすすめです。",en:"A button with an external link icon. This is recommended if you want to clearly state that the link will open in a separate tab."},imgFormat:"svg",inputs:{colors:[{legend:o.LEGEND.BASE_COLOR,defaultValue:o.COLOR.BLUE}],radios:[n.RADIO.SHAPE,n.RADIO.ICON_POSITION]},codeFunc({colors:e,radios:t}){return{html:'<button class="button-55">ボタンデザイン</button>',css:`.button-55 {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${t[0]};
    background-color: ${e[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}

.button-55::${t[1]?"before":"after"} {
    width: 1.25em;
    height: 1.25em;
    margin-${t[1]?"right":"left"}: 8px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}

.button-55:hover {
    background-color: ${a(e[0],-1)};
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-56'] = (function(e, n, a){
    const c = {id:56,name:{ja:"メールアイコン",en:"Mail icon"},comment:{ja:"メールアイコンを付けたボタン。お問い合わせページへの導線などにどうぞ。",en:"Button with email icon. Please use this as a link to the contact page."},imgFormat:"svg",inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[n.RADIO.SHAPE,n.RADIO.ICON_POSITION]},codeFunc({colors:o,radios:t}){return{html:'<button class="button-56">ボタンデザイン</button>',css:`.button-56 {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${t[0]};
    background-color: ${o[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}

.button-56:hover {
    background-color: ${a(o[0],-1)};
}

.button-56::${t[1]?"before":"after"} {
    width: 1.25em;
    height: 1.25em;
    margin-${t[1]?"right":"left"}: 8px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM12.0606 11.6829L5.64722 6.2377L4.35278 7.7623L12.0731 14.3171L19.6544 7.75616L18.3456 6.24384L12.0606 11.6829Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-64'] = (function(n, o, r){
    const s = {id:64,name:{ja:"お気に入り",en:"Favorite"},imgFormat:"svg",inputs:{colors:[{legend:n.LEGEND.BASE_COLOR,defaultValue:"#f1443e"}],radios:[o.RADIO.SHAPE,o.RADIO.ICON_POSITION]},codeFunc({colors:t,radios:e}){return{html:'<button class="button-64">ボタンデザイン</button>',css:`.button-64 {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: 1px solid ${t[0]};
    border-radius: ${e[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-64:hover {
    background-color: ${r(t[0])};
}

.button-64::${e[1]?"before":"after"} {
    width: 1.25em;
    height: 1.25em;
    margin-${e[1]?"right":"left"}: 8px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z' fill='%23${r(t[0])}'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON, _di_funcs.r);
  root.designInserterPartCodeFuncs['button-10'] = (function(r, e, i){
    const s = {id:10,name:{ja:"通り抜ける光",en:"Light passing through"},imgFormat:"gif",inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-10">ボタンデザイン</button>',css:`.button-10 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: 1em 2em;
    overflow: hidden;
    border: none;
    border-radius: ${o[0]};
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}

.button-10::before {
    display: block;
    position: absolute;
    top: -50%;
    left: -30%;
    transform: rotate(30deg);
    width: 70px;
    height: 100px;
    content: '';
    background-image: linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
    background-image: -webkit-gradient(linear, left bottom, right bottom, color-stop(0%, rgba(255, 255, 255, 0)), color-stop(50%, rgba(255, 255, 255, 1)), color-stop(100%, rgba(255, 255, 255, 0)));
    animation: animation-button-10 2s infinite linear;
}

@keyframes animation-button-10 {
    17% {
        left: 120%;
    }
    100% {
        left: 120%;
    }
}${o[1]?`

.button-10::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}

.button-10:hover {
    background-color: ${i(t[0],-1)};
}
`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_common_button.COMMON, _di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-59'] = (function(t, a){
    const f = {id:59,name:{ja:"輝き",en:"Shine"},imgFormat:"svg",comment:{ja:"SVGを利用しボタン右上で星を光らせてみました。光を際立たせるためにも、背景色はできるだけ黒系統するのがおすすめです。",en:"I used SVG to make a star shine at the top right of the button. To make the light stand out, we recommend using a black background color as much as possible."},options:{bgColor:t.COLOR.BLACK_DARKMODE},inputs:{colors:[{legend:t.LEGEND.BASE_COLOR,defaultValue:t.COLOR.BLUE}],radios:[a.RADIO.SHAPE]},codeFunc({colors:o,radios:e}){return{html:'<button class="button-59">ボタンデザイン</button>',css:`.button-59 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    min-width: 250px;
    margin: 3em auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${e[0]};
    background-color: ${o[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
    animation: anim-button-59-bright 1.4s ease-out infinite;
}

.button-59:hover {
    background-color: #1579c0;
}

.button-59::before,
.button-59::after {
    position: absolute;
    top: -1.5em;
    right: -1.5em;
    width: 3em;
    height: 3em;
    content: '';
}

.button-59::before {
    border: 1px solid #ffffff33;
    border-radius: 50%;
    animation: anim-button-59-circle 1.4s linear infinite;
}

.button-59::after {
    background: url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20190%20247%22%3E%3Cpath%20d%3D%22M190%2C123.5c-90%2C3.6-92.2%2C6.5-95%2C123.5-2.8-117-5-119.9-95-123.5%2C90-3.6%2C92.2-6.5%2C95-123.5%2C2.8%2C117%2C5%2C119.9%2C95%2C123.5Z%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E') no-repeat center;
    animation: anim-button-59-star 1.4s linear infinite;
    filter: opacity(.8);
}

@keyframes anim-button-59-bright{
    75% {
        filter: unset;
    }
    80% {
        filter: brightness(1.1);
    }
}

@keyframes anim-button-59-circle {
    0% {
        opacity: 0;
        transform: scale(0);
    }
    75% {
        opacity: 0;
    }
    80% {
        opacity: 1;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(1.5);
    }
}

@keyframes anim-button-59-star {
    0% {
        opacity: 0;
        transform: scale(0);
    }
    75% {
        opacity: 0;
        transform: scale(0);
    }
    80% {
        opacity: 1;
    }
    85% {
        opacity: 1;
        transform: scale(1.5) rotate(50deg);
    }
    95% {
        opacity: 0;
        transform: scale(4) rotate(150deg);
    }
    100% {
        opacity: 0;
        transform: scale(0) rotate(80deg);
    }
}`}}};
    return function(params){ return f.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-51'] = (function(o){
    const s = {id:51,name:{ja:"伸びる下線",en:"Stretching underline"},imgFormat:"gif",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:o.COLOR.BLUE}]},codeFunc({colors:t}){return{html:'<button class="button-51">ボタンデザイン</button>',css:`.button-51 {
    display: flex;
    justify-content: center;
    position: relative;
    width: 200px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    border-bottom: 2px solid #e6edf3;
    background-color: transparent;
    color: #333;
    font-weight: 600;
    font-size: 1em;
}

.button-51::after {
    position: absolute;
    bottom: -3px;
    left: 0;
    transform: scaleX(0);
    transform-origin: center left;
    width: 100%;
    height: 2px;
    background-color: ${t[0]};
    content: '';
    transition: transform .3s ease;
}

.button-51:hover::after {
    transform: scaleX(1);
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['button-36'] = (function(e, r){
    const u = {id:36,name:{ja:"色が反転",en:"Color inverted"},imgFormat:"gif",comment:{ja:"ホバーすると背景色が基調色となるボタン。シンプルながらもしっかりと目を引くことができます。",en:"A button whose background color becomes the base color when hovered over. Although it is simple, it can definitely catch the eye."},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-36">ボタンデザイン</button>',css:`.button-36 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: 1px solid ${t[0]};
    border-radius: ${o[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-36:hover {
    border: none;
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
}${o[1]?`

.button-36::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}

.button-36:hover::after {
    border-color: #fff;
}`:""}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-29'] = (function(e, r){
    const u = {id:29,name:{ja:"横にスライド",en:"slide sideways"},imgFormat:"gif",comment:{ja:"背景が横からスライドしてくるボタン。矢印アイコンとの親和性も高めです。",en:"A button whose background slides from the side. It also has a high affinity with arrow icons."},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-29">ボタンデザイン</button>',css:`.button-29 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    overflow: hidden;
    border: 1px solid ${t[0]};
    border-radius: ${o[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-29:hover {
    background-color: transparent;
    color: #fff;
}

.button-29::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 0;
    height: 100%;
    background-color: ${t[0]};
    content: '';
    transition: width .3s ease;
}

.button-29:hover::before {
    width: 100%;
}${o[1]?`

.button-29::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}

.button-29:hover::after {
    border-color: #fff;
}`:""}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-31'] = (function(e, r){
    const m = {id:31,name:{ja:"狭まりながら塗りつぶす",en:"Fill while narrowing"},imgFormat:"gif",inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-31">ボタンデザイン</button>',css:`.button-31 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    border: 1px solid ${t[0]};
    border-radius: ${o[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
    transition: box-shadow .3s ease;
}

.button-31:hover {
    box-shadow: inset ${t[0]} 0 0 0 2em;
    color: #fff;
}
${o[1]?`

.button-31::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}

.button-31:hover::after {
    border-color: #fff;
}`:""}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-32'] = (function(e, r){
    const p = {id:32,name:{ja:"対角線上に広がる",en:"Spread diagonally"},imgFormat:"gif",inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:'<button class="button-32">ボタンデザイン</button>',css:`.button-32 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    overflow: hidden;
    border: 1px solid ${t[0]};
    border-radius: ${o[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-32:hover {
    background-color: transparent;
    color: #fff;
}

.button-32::before {
    position: absolute;
    z-index: -1;
    transform: rotate(-30deg);
    width: 100%;
    height: 0;
    border-radius: ${o[0]};
    background-color: ${t[0]};
    content: '';
    transition: height .3s ease;
}

.button-32:hover::before {
    height: 350%;
}${o[1]?`

.button-32::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}

.button-32:hover::after {
    border-color: #fff;
}`:""}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-30'] = (function(r, i){
    const u = {id:30,name:{ja:"波紋",en:"Ripple"},imgFormat:"gif",inputs:{colors:[{legend:i.LEGEND.BASE_COLOR,defaultValue:i.COLOR.BLUE}],radios:[r.RADIO.SHAPE,r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:e}){const o=n(t[0]);return{html:'<button class="button-30">ボタンデザイン</button>',css:`.button-30 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    border: 1px solid ${t[0]};
    border-radius: ${e[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-30:hover {
    animation: anima-button-30 1s;
}

@keyframes anima-button-30 {
    0% {
        box-shadow: 0 0 0 0 rgb(${o[0]} ${o[1]} ${o[2]} / 50%);
    }
    100% {
        box-shadow: 0 0 0 1.2em rgb(0 0 0 / 0%);
    }
}${e[1]?`

.button-30::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}`:""}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_common_button.COMMON, _di_consts);
  root.designInserterPartCodeFuncs['button-33'] = (function(e, r){
    const d = {id:33,name:{ja:"枠線を描画",en:"Draw border"},imgFormat:"gif",inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[r.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:o}){return{html:o[0]?`<button class="button-33">
    <span>ボタンデザイン</span>
</button>`:'<button class="button-33">ボタンデザイン</button>',css:`.button-33 {
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    color: ${t[0]};
    font-size: 1em;
}

.button-33::before,
.button-33::after {
    position: absolute;
    z-index: -1;
    width: 0;
    height: 1px;
    content: '';
}

.button-33::before {
    top: -1px;
    left: 0;
    border-top: 1px solid transparent;
    border-right: 1px solid transparent;
}

.button-33::after {
    bottom: 0;
    right: 0;
    border-bottom: 1px solid transparent;
    border-left: 1px solid transparent;
}

.button-33:hover::before,
.button-33:hover::after {
    width: 100%;
    height: 100%;
    border-color: ${t[0]};
    transition: width .3s ease, height .3s .3s ease;
}${o[0]?`

.button-33 span {
    display: flex;
    justify-content: center;
    align-items: center;
}

.button-33 span::after {
    display: inline-block;
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}`:""}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-41'] = (function(o, n){
    const l = {id:41,name:{ja:"バウンド",en:"Bounce"},imgFormat:"gif",inputs:{colors:[{legend:n.LEGEND.BASE_COLOR,defaultValue:n.COLOR.BLUE}],radios:[o.RADIO.SHAPE,o.RADIO.ARROW_ICON,o.RADIO.ANIMATION_COUNT]},codeFunc({colors:r,radios:t}){return{html:'<button class="button-41">ボタンデザイン</button>',css:`.button-41 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${t[0]};
    background-color: ${r[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}

.button-41:hover {
    animation: anima-button-41 2s linear${t[2]?" infinite":""};
}

@keyframes anima-button-41 {
    7% {
        transform: translateY(-15px);
    }
    15% {
        transform: translateY(0);
    }
    20% {
        transform: translateY(-7px);
    }
    25% {
        transform: translateY(0);
    }
}${t[1]?`

.button-41::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_common_button.COMMON, _di_consts);
  root.designInserterPartCodeFuncs['button-38'] = (function(o, r){
    const p = {id:38,name:{ja:"震える",en:"Shake"},imgFormat:"gif",inputs:{colors:[{legend:r.LEGEND.BASE_COLOR,defaultValue:r.COLOR.BLUE}],radios:[o.RADIO.SHAPE,o.RADIO.ARROW_ICON,o.RADIO.ANIMATION_COUNT]},codeFunc({colors:n,radios:t}){return{html:'<button class="button-38">ボタンデザイン</button>',css:`.button-38 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${t[0]};
    background-color: ${n[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}

.button-38:hover {
    animation: anime-button-38 .3s linear${t[2]?" infinite":""};
}

@keyframes anime-button-38 {
    20% {
        transform: translate(-2px, 2px);
    }
    40% {
        transform: translate(-2px, -2px);
    }
    60% {
        transform: translate(2px, 2px);
    }
    80% {
        transform: translate(2px, -2px);
    }
}${t[1]?`

.button-38::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}`:""}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_common_button.COMMON, _di_consts);
  root.designInserterPartCodeFuncs['button-37'] = (function(a, i, o){
    const u = {id:37,name:{ja:"ローディング",en:"Loading"},imgFormat:"gif",comment:{ja:"クリックするとローディングアニメーションが表示されるボタン。JavaScriptを使わないので、単純なリンクとしてボタンを設置する際などにおすすめです。",en:"A button that displays a loading animation when clicked. Since it does not use Java Script, it is recommended when setting up a button as a simple link."},inputs:{colors:[{legend:a.LEGEND.BASE_COLOR,defaultValue:a.COLOR.BLUE}],radios:[i.RADIO.SHAPE,i.RADIO.ARROW_ICON]},codeFunc({colors:t,radios:e}){return{html:'<button class="button-37">ボタンデザイン</button>',css:`.button-37 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: 1px solid ${t[0]};
    border-radius: ${e[0]};
    background-color: #fff;
    color: ${t[0]};
    font-size: 1em;
}

.button-37:focus {
    color: transparent;
}

.button-37:focus::before {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%20width%3D%2248%22%20height%3D%2248%22%20fill%3D%22%23${o(t[0])}%22%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(0%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(45%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220.125s%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(90%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220.25s%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(135%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220.375s%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(180%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220.5s%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(225%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220.625s%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(270%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220.75s%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%20%3Cpath%20d%3D%22M14%200%20H18%20V8%20H14%20z%22%20transform%3D%22rotate(315%2016%2016)%22%20opacity%3D%22.1%22%3E%20%3Canimate%20attributeName%3D%22opacity%22%20from%3D%221%22%20to%3D%22.1%22%20begin%3D%220.875s%22%20dur%3D%221s%22%20repeatCount%3D%22indefinite%22%2F%3E%20%3C%2Fpath%3E%3C%2Fsvg%3E') no-repeat center / 1.7em;
    content: '';
}${e[1]?`

.button-37::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid ${t[0]};
    border-right: 2px solid ${t[0]};
    content: '';
}

.button-37:focus::after {
    content: none;
}`:""}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON, _di_funcs.r);
  root.designInserterPartCodeFuncs['button-44'] = (function(e, r){
    const s = {id:44,name:{ja:"ストライプ背景 & 枠線",en:"Striped background & border"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLACK_TEXT}],radios:[r.RADIO.SHAPE,{legend:{ja:"シャドウ",en:"Shadow"},choices:e.CHOICES.OFF},r.RADIO.ARROW_ICON]},codeFunc({colors:o,radios:t}){return{html:'<button class="button-44">ボタンデザイン</button>',css:`.button-44 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: 1px solid ${o[0]};
    border-radius: ${t[0]};${t[1]?`
    box-shadow: 0 7px 15px -5px rgb(0 0 0 / 10%);`:""}
    background-image: repeating-linear-gradient(-45deg, #eee, #eee 1px, #ffffff 1px, #ffffff 4px);
    color: ${o[0]};
    font-weight: 600;
    font-size: 1em;
    transition: box-shadow .3s;
}

.button-44:hover {
    box-shadow: 0 7px 30px -5px rgb(0 0 0 / 20%);
}${t[2]?`

.button-44::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #333;
    border-right: 2px solid #333;
    content: '';
}`:""}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-40'] = (function(r, o){
    const d = {id:40,name:{ja:"白背景 & シャドウ",en:"White background & shadow"},inputs:{radios:[o.RADIO.SHAPE,o.RADIO.ARROW_ICON]},options:{bgColor:r.COLOR.SILVER},codeFunc({radios:t}){return{html:'<button class="button-40">ボタンデザイン</button>',css:`.button-40 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: ${t[0]};
    box-shadow: 0 7px 10px rgb(0 0 0 / 10%);
    background-color: #fff;
    color: #333;
    font-size: 1em;
    transition: transform .3s, box-shadow .3s;
}

.button-40:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 10px rgb(0 0 0 / 15%);
}${t[1]?`

.button-40::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #333;
    border-right: 2px solid #333;
    content: '';
}`:""}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-21'] = (function(e, p){
    const d = {id:21,name:{ja:"ニューモーフィズム風",en:"Neumorphism style"},options:{bgColor:"#e7e7e7"},inputs:{colors:[{legend:e.LEGEND.TEXT_COLOR,defaultValue:"#555555"}],radios:[p.RADIO.SHAPE]},codeFunc({colors:o,radios:t}){return{html:'<button class="button-21">ボタンデザイン</button>',css:`.button-21 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    padding: 1em 2em;
    border: 1px solid #e7e7e7;
    border-radius: ${t[0]};
    box-shadow: 6px 6px 12px #c5c5c5, -6px -6px 12px #fff;
    background-color: #e7e7e7;
    color: ${o[0]};
    font-weight: 600;
}

.button-21:hover {
    box-shadow: inset 4px 4px 12px #c5c5c5, inset -4px -4px 12px #fff;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON);
  root.designInserterPartCodeFuncs['button-14'] = (function(r, n, e){
    const l = {id:14,name:{ja:"コントラスト強め",en:"Stronger contrast"},imgFormat:"svg",inputs:{colors:[{legend:r.LEGEND.BASE_COLOR,defaultValue:"#ffff00"}],radios:[n.RADIO.SHAPE]},codeFunc({colors:t,radios:o}){return{html:`<button class="button-14">
    <span>ボタン</span>
</button>`,css:`.button-14,
.button-14 span {
    display: flex;
    justify-content: center;
    align-items: center;
}

.button-14 {
    position: relative;
    width: 250px;
    margin: 0 auto;
    padding: 0;
    border-radius: ${o[0]};
    border: none;
    font-size: 1em;
}

.button-14::before {
    position: absolute;
    top: 7px;
    z-index: -1;
    width: 100%;
    height: 100%;
    border: 2px solid #000;
    border-radius: inherit;
    box-sizing: inherit;
    box-shadow: 0 5px 0 0 rgba(0, 0, 0, .2);
    background-color: ${e(t[0],-3)};
    content: '';
}

.button-14 span {
    width: 100%;
    padding: .9em 2em;
    border: 2px solid #000;
    border-radius: inherit;
    background-color: ${t[0]};
    color: #000;
    font-weight: 600;
    line-height: 1.5;
}

.button-14 span::after {
    display: inline-block;
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #000;
    border-right: 2px solid #000;
    content: '';
}

.button-14:hover::before {
    transition: box-shadow .2s;
    box-shadow: 0 3px 0 0 rgba(0, 0, 0, .2);
}

.button-14:hover span {
    transition: transform .2s;
    transform: translateY(2px);
}
`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts, _di_common_button.COMMON, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-47'] = (function(o){
    const p = {id:47,name:{ja:"クラシカル",en:"Classical"},imgFormat:"svg",comment:{ja:"古めのOSのUIを彷彿とさせる、クラシックなデザインのボタン。使い勝手に関しては微妙ですが、遊び心を入れたい方にはおすすめです。",en:"A button with a classic design reminiscent of the UI of an old OS. Although it's not easy to use, it's recommended for those who want to add some playfulness to it."},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:"#c0c0c0"}]},codeFunc({colors:t}){return{html:'<button class="button-47">ボタンデザイン</button>',css:`.button-47 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    margin: 0 auto;
    padding: .5em 1em;
    border: none;
    box-shadow: inset -1px -1px #333, inset 1px 1px #fff, inset -2px -2px #999, inset 2px 2px #ffffff;
    background-color: ${t[0]};
    color: #333;
    font-size: 1em;
    outline: 1px dotted #333;
    outline-offset: -4px;
}

.button-47:active {
    box-shadow: inset -1px -1px #fff, inset 1px 1px #333, inset -2px -2px #ffffff, inset 2px 2px #999;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['button-13'] = (function(o, e){
    const u = {id:13,name:{ja:"リアルな円形",en:"Realistic circular shape"},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:"#1579c0"},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.WHITE}]},codeFunc({colors:t}){return{html:'<button class="button-13">ボタンデザイン</button>',css:`.button-13 {
    width: 80px;
    height: 80px;
    border: none;
    border-bottom: solid 2px #c0c0c0;
    border-radius: 50%;
    box-shadow: inset 15px 30px 40px rgba(255, 255, 255, 0.5), 0 3px 7px rgba(0, 0, 0, .2);
    background-image: linear-gradient(${t[0]} 0%, ${e(t[0],-1)} 100%);
    color: ${t[1]};
    font-weight: 600;
    font-size: 1em;
}
`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['button-46'] = (function(t){
    const i = {id:46,name:{ja:"凹凸感強め",en:"Strong sense of unevenness"},options:{bgColor:t.COLOR.SILVER},inputs:{colors:[{legend:t.LEGEND.TEXT_COLOR,defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc({colors:o}){return{html:`<button class="button-46">
    <span>ボタン</span>
</button>`,css:`.button-46 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    padding: 8px;
    border: none;
    border-radius: 50%;
    box-shadow: 0 10px 10px rgb(0 0 0 / 20%);
    background-image: linear-gradient(0, #ddd, #fff);
    color: ${o[0]};
    font-weight: 600;
    font-size: .9em;
    transition: transform .3s, box-shadow .3s;
}

.button-46:hover {
    transform: scale(.99);
    box-shadow: 0 5px 5px rgb(0 0 0 / 20%);
}

.button-46 span {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-image: linear-gradient(0, #fff, #ddd);
    line-height: 64px;
}`}}};
    return function(params){ return i.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-18'] = (function(t){
    const n = {id:18,name:{ja:"交差する枠線",en:"Intersecting border"},inputs:{colors:[{legend:t.LEGEND.BASE_COLOR,defaultValue:t.COLOR.BLUE}]},codeFunc({colors:o}){return{html:`<div class="box-018">
    枠線を交差させたボックス。はみ出す線は縦横で同じ長さになるようにしていますが、こちらはお好みで調整してください。
</div>`,css:`.box-018 {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
    padding: 1em calc(1.5em + 9px);
    border-top: 1px solid ${o[0]};
    border-bottom: 1px solid ${o[0]};
    color: #333;
}

.box-018::before,
.box-018::after {
    position: absolute;
    width: 1px;
    top: 50%;
    transform: translateY(-50%);
    height: calc(100% + 20px);
    background-color: ${o[0]};
    content: '';
}

.box-018::before {
    left: 9px;
}

.box-018::after {
    right: 9px;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-21'] = (function(e){
    const l = {id:21,name:{ja:"番号あり",en:"With number"},comment:{ja:"左上に番号を添えたボックス。表示する番号はHTMLタグの属性で指定することができます。",en:"A box with a number on the top left. The number to be displayed can be specified using the HTML tag attribute."},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[{legend:{ja:"番号の形状",en:"Number shape"},choices:[{label:{ja:"円",en:"Circle"},value:e.BORDER_RADIUS.HALF},{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["3PX"]}]}]},codeFunc({colors:t,radios:o}){return{html:`<div class="box-021" data-number="1">
    左上に番号を添えたボックス。ステップに沿って何かを説明・補足したい時におすすめのデザインです。
</div>`,css:`.box-021 {
    position: relative;
    max-width: 400px;
    margin: 1em auto;
    padding: 1em 1.5em;
    border: 2px solid ${t[0]};
    border-radius: 3px;
    color: #333;
}

.box-021::before {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: -1em;
    left: -1em;
    width: 2em;
    height: 2em;
    border-radius: ${o[0]};
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    content: attr(data-number);
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-11'] = (function(e){
    const d = {id:11,name:{ja:"タイトル (枠外)",en:"Title (outside frame)"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}]},codeFunc({colors:o}){return{html:`<div class="box-011">
    <span>タイトル</span>
    <p>枠外にタイトルを付けたボックス。タイトルが枠外にあるかつ単色なので、スッキリしたデザインになっています。</p>
</div>`,css:`.box-011 {
    position: relative;
    max-width: 400px;
    margin: 1.9em auto 0;
    padding: 1em 1.5em;
    border: 2px solid ${o[0]};
    border-radius: 3px;
}

.box-011 span {
    position: absolute;
    top: -1.9em;
    left: -2px;
    padding: .2em .8em;
    border-radius: 5px 5px 0 0;
    background-color: ${o[0]};
    color: #fff;
}

.box-011 p {
    margin: 0;
    color: #333;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-12'] = (function(r){
    const n = {id:12,name:{ja:"タイトル (枠内)",en:"Title (inside frame)"},inputs:{colors:[{legend:r.LEGEND.BASE_COLOR,defaultValue:r.COLOR.BLUE}]},codeFunc({colors:o}){return{html:`<div class="box-012">
    <span>タイトル</span>
    <p>枠内にタイトルを付けたボックス。単色なのでスッキリしたデザインになっています。タイトル前にアイコンを付けるのもおすすめです。</p>
</div>`,css:`.box-012 {
    max-width: 400px;
    margin: 0 auto;
    border: 2px solid ${o[0]};
    border-radius: 3px;
    overflow: hidden;
}

.box-012 span {
    padding: .4em .8em;
    background-color: ${o[0]};
    color: #fff;
}

.box-012 p {
    margin: 0;
    padding: 1em 1.5em;
    color: #333;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-19'] = (function(e){
    const p = {id:19,name:{ja:"タイトル (吹き出し風)",en:"Title (speech bubble style)"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[{legend:{ja:"吹き出しの形状",en:"Speech bubble shape"},choices:[{label:{ja:"角丸",en:"Rounded corners"},value:e.BORDER_RADIUS.ELLIPSE},{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["5PX"]}]}]},codeFunc({colors:o,radios:t}){return{html:`<div class="box-019">
    <div>タイトル</div>
    <p>吹き出し風のタイトルを付けたボックス。角丸にすることで、よりポップで可愛らしい印象を与えることができます。</p>
</div>`,css:`.box-019 {
    position: relative;
    margin-top: 1em;
    padding: 1.8em 1.5em 1em 1.5em;
    border: 2px solid ${o[0]};
}

.box-019 > div {
    position: absolute;
    top: -1.15em;
    left: -.5em;
    padding: .4em 1.4em;
    border-radius: ${t[0]};
    background-color: ${o[0]};
    color: #fff;
    font-size: .9em;
}

.box-019 > div::before {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 8px;
    background-color: ${o[0]};
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.box-019 p {
    margin: 0;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-13'] = (function(e){
    const p = {id:13,name:{ja:"タイトル (上部中心)",en:"Title (top center)"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}]},codeFunc({colors:o}){return{html:`<div class="box-013">
    <span>タイトル</span>
    <p>枠内の上中心にタイトルを付けたボックス。タイトルをより目立たせたい場合や文字数が長くなる場合におすすめです。</p>
</div>`,css:`.box-013 {
    max-width: 400px;
    margin: 0 auto;
    border: 2px solid ${o[0]};
    border-radius: 3px;
}

.box-013 span {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: .5em 0;
    background-color: ${o[0]};
    color: #fff;
    font-weight: 600;
}

.box-013 p {
    margin: 0;
    padding: 1em 1.5em;
    color: #333;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-17'] = (function(o){
    const m = {id:17,name:{ja:"見出し風",en:"Heading style"},inputs:{colors:[{legend:{ja:"上線の色",en:"overline color"},defaultValue:o.COLOR.BLUE},{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.SILVER}],radios:[{legend:{ja:"シャドウ",en:"Shadow"},choices:o.CHOICES.OFF}]},codeFunc({colors:e,radios:d}){return{html:`<div class="box-017">
    <div>タイトル</div>
    <p>見出し風にタイトルを付けたボックス。上枠線とタイトルの色は、サイトのテーマカラーなどに統一するのがおすすめです。</p>
</div>`,css:`.box-017 {
    max-width: 400px;
    margin: 0 auto;
    padding: .5em 1.5em 1em;
    border-top: 5px solid ${e[0]};
    border-radius: 3px;${d[0]?`
    box-shadow: 0 2px 3px rgb(0 0 0 / 20%);`:""}
    background-color: ${e[1]};
}

.box-017 > div {
    margin-bottom: .5em;
    color: ${e[0]};
    font-weight: 600;
    font-size: 1.05em;
}

.box-017 > p {
    margin: 0;
    color: #333;
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-16'] = (function(o){
    const n = {id:16,name:{ja:"引用風",en:"Quote style"},inputs:{colors:[{legend:{ja:"左線の色",en:"Left line color"},defaultValue:o.COLOR.BLUE},{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.SILVER}],radios:[{legend:{ja:"シャドウ",en:"Shadow"},choices:o.CHOICES.OFF}]},codeFunc({colors:e,radios:a}){return{html:`<div class="box-016">
    引用ブロックのように左線を付けたボックス。どんなサイトとも合う、余白落ち着きのある可愛らしいデザインが特徴です。
</div>`,css:`.box-016 {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
    padding: 1em 1.5em;
    border-left: 5px solid ${e[0]};${a[0]?`
    box-shadow: 0 2px 3px rgb(0 0 0 / 20%);`:""}
    background-color: ${e[1]};
    color: #333;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-6'] = (function(a, o){
    const m = {id:6,name:{ja:"メモアイコン (小)",en:"Memo icon (small)"},inputs:{colors:[{legend:a.LEGEND.BG_COLOR,defaultValue:"#fff9e5"},{legend:a.LEGEND.ICON_COLOR,defaultValue:"#ffb36b"},{legend:a.LEGEND.TEXT_COLOR,defaultValue:a.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="box-006">
    <p>メモアイコン付きの小さいボックスです。</p>
</div>`,css:`.box-006 {
    display: flex;
    grid-gap: 0 .7em;
    margin: 0 auto;
    padding: 1em;
    border-radius: 5px;
    background-color: ${e[0]};
    color: ${e[2]};
}

.box-006::before {
    width: 24px;
    height: 24px;
    content: '';
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.8995 6.85453L17.1421 11.0972L7.24264 20.9967H3V16.754L12.8995 6.85453ZM14.3137 5.44032L16.435 3.319C16.8256 2.92848 17.4587 2.92848 17.8492 3.319L20.6777 6.14743C21.0682 6.53795 21.0682 7.17112 20.6777 7.56164L18.5563 9.68296L14.3137 5.44032Z' fill='%23${o(e[1])}'%3E%3C/path%3E%3C/svg%3E");
}

.box-006 p {
    margin: 0;
    padding: 0 0 0 .7em;
    border-left: 1px solid ${e[1]};
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['box-8'] = (function(t){
    const l = {id:8,name:{ja:"チェックアイコン (小)",en:"Check icon (small)"},inputs:{colors:[{legend:t.LEGEND.BG_COLOR,defaultValue:"#ecffe9"},{legend:t.LEGEND.ICON_COLOR,defaultValue:"#86d67c"},{legend:t.LEGEND.TEXT_COLOR,defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="box-008">
    <p>チェックアイコン付きの小さいボックスです。</p>
</div>`,css:`.box-008 {
    display: flex;
    align-items: center;
    grid-gap: 0 .7em;
    margin: 0 auto;
    padding: 1em;
    border-radius: 5px;
    background-color: ${e[0]};
    color: ${e[2]};
}

.box-008::before {
    width: 16px;
    height: 8px;
    border-bottom: 3px solid ${e[1]};
    border-left: 3px solid ${e[1]};
    transform: rotate(-45deg) translate(2.5px, -2.5px);
    content: '';
}

.box-008 p {
    margin: 0;
    padding: 0 0 0 .7em;
    border-left: 1px solid ${e[1]};
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-4'] = (function(a, o){
    const m = {id:4,name:{ja:"注意アイコン (小)",en:"Attention icon (small)"},inputs:{colors:[{legend:a.LEGEND.BG_COLOR,defaultValue:"#ffebee"},{legend:a.LEGEND.ICON_COLOR,defaultValue:"#f06060"},{legend:a.LEGEND.TEXT_COLOR,defaultValue:a.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="box-004">
    <p>注意アイコン付きの小さいボックスです。</p>
</div>`,css:`.box-004 {
    display: flex;
    grid-gap: 0 .7em;
    margin: 0 auto;
    padding: 1em;
    border-radius: 5px;
    background-color: ${e[0]};
    color: ${e[2]};
}

.box-004::before {
    width: 24px;
    height: 24px;
    content: '';
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM10.9999 16.0002V18.0002H12.9999V16.0002H10.9999ZM10.9999 9.00017V14.0002H12.9999V9.00017H10.9999Z' fill='%23${o(e[1])}'%3E%3C/path%3E%3C/svg%3E");
}

.box-004 p {
    margin: 0;
    padding: 0 0 0 .7em;
    border-left: 1px solid ${e[1]};
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['box-7'] = (function(e, o){
    const l = {id:7,name:{ja:"メモアイコン (大)",en:"Memo icon (Large)"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:"#ffb36b"},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:i}){return{html:`<div class="box-007">
    <div>
        タイトル
    </div>
    <p>メモアイコン付きの大きいボックス。補足や詳細な説明をする時におすすめです。</p>
</div>`,css:`.box-007 {
    max-width: 400px;
    margin: 0 auto;
    border: 2px solid ${i[0]};
    border-radius: 5px;
    color: ${i[1]};
}

.box-007 div {
    display: inline-flex;
    align-items: center;
    column-gap: 4px;
    position: relative;
    top: -13px;
    left: 10px;
    margin: 0 7px;
    padding: 0 8px;
    background: #fff;
    color: ${i[0]};
    font-weight: 600;
    vertical-align: top;
}

.box-007 div::before {
    width: 22px;
    height: 22px;
    content: '';
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.8995 6.85453L17.1421 11.0972L7.24264 20.9967H3V16.754L12.8995 6.85453ZM14.3137 5.44032L16.435 3.319C16.8256 2.92848 17.4587 2.92848 17.8492 3.319L20.6777 6.14743C21.0682 6.53795 21.0682 7.17112 20.6777 7.56164L18.5563 9.68296L14.3137 5.44032Z' fill='%23${o(i[0])}'%3E%3C/path%3E%3C/svg%3E");
}

.box-007 p {
    margin: 0;
    padding: 0 1.5em 1em;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['box-9'] = (function(i){
    const r = {id:9,name:{ja:"チェックアイコン (大)",en:"Check icon (Large)"},inputs:{colors:[{legend:i.LEGEND.BASE_COLOR,defaultValue:"#86d67c"},{legend:i.LEGEND.TEXT_COLOR,defaultValue:i.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="box-009">
    <div>
        タイトル
    </div>
    <p>メモアイコン付きの大きいボックス。補足や詳細な説明をする時におすすめです。</p>
</div>`,css:`.box-009 {
    max-width: 400px;
    margin: 0 auto;
    border: 2px solid ${e[0]};
    border-radius: 5px;
    color: ${e[1]};
}

.box-009 div {
    display: inline-flex;
    align-items: center;
    column-gap: 4px;
    position: relative;
    top: -13px;
    left: 10px;
    margin: 0 7px;
    padding: 0 8px;
    background: #fff;
    color: ${e[0]};
    font-weight: 600;
    vertical-align: top;
}

.box-009 div::before {
    width: 15px;
    height: 7.5px;
    border-bottom: 3px solid ${e[0]};
    border-left: 3px solid ${e[0]};
    transform: rotate(-45deg) translate(2px, -2px);
    content: '';
}

.box-009 p {
    margin: 0;
    padding: 0 1.5em 1em;
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-5'] = (function(e, t){
    const l = {id:5,name:{ja:"注意アイコン (大)",en:"Attention icon (Large)"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:"#f06060"},{legend:e.LEGEND.TEXT_COLOR,defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:i}){return{html:`<div class="box-005">
    <div>
        タイトル
    </div>
    <p>注意アイコン付きの大きいボックス。赤系の色にするのがおすすめです。</p>
</div>`,css:`.box-005 {
    max-width: 400px;
    margin: 0 auto;
    border: 2px solid ${i[0]};
    border-radius: 5px;
    color: ${i[1]};
}

.box-005 div {
    display: inline-flex;
    align-items: center;
    column-gap: 4px;
    position: relative;
    top: -13px;
    left: 10px;
    margin: 0 7px;
    padding: 0 8px;
    background: #fff;
    color: ${i[0]};
    font-weight: 600;
    vertical-align: top;
}

.box-005 div::before {
    width: 22px;
    height: 22px;
    content: '';
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM10.9999 16.0002V18.0002H12.9999V16.0002H10.9999ZM10.9999 9.00017V14.0002H12.9999V9.00017H10.9999Z' fill='%23${t(i[0])}'%3E%3C/path%3E%3C/svg%3E");
}

.box-005 p {
    margin: 0;
    padding: 0 1.5em 1em;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['box-14'] = (function(r){
    const s = {id:14,name:{ja:"チェック柄",en:"Plaid"},inputs:{colors:[{legend:r.LEGEND.BASE_COLOR,defaultValue:"#5ba9f7"}],radios:[{legend:{ja:"枠線",en:"Border"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:a,radios:e}){return{html:'<div class="box-014">チェック柄のボックス。可愛い系のサイトはもちろんのこと、基調色を落ち着いた色にすることで意外とどんなサイトともマッチします。</div>',css:`.box-014 {
    max-width: 400px;
    margin: 0 auto;
    padding: 1em 1.5em;${e[0]?`
    border: 2px solid ${a[0]};`:""}
    border-radius: 3px;
    background-image: linear-gradient(45deg, ${a[0]}12 25%, transparent 25%, transparent 50%, ${a[0]}12 50%, ${a[0]}12 75%, transparent 75%, transparent), linear-gradient(-45deg, ${a[0]}12 25%, transparent 25%, transparent 50%, ${a[0]}12 50%, ${a[0]}12 75%, transparent 75%, transparent);
    background-color: ${a[0]}0d;
    background-size: 20px 20px;
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-20'] = (function(r, t){
    const l = {id:20,name:{ja:"めくられた紙風",en:"Turned paper style"},inputs:{colors:[{legend:r.LEGEND.BG_COLOR,defaultValue:r.COLOR.BLUE_LIGHT}]},codeFunc({colors:o}){return{html:`<div class="box-020">
    紙をめくったように見えるボックス。背景だけのシンプルさにワンポイントの可愛さを加えたデザインとなっています。
</div>`,css:`.box-020 {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
    padding: 1em 1.5em;
    background-color: ${o[0]};
    color: #333;
}

.box-020::after {
    position: absolute;
    top: 0;
    right: 0;
    border-width: 0 20px 20px 0;
    border-style: solid;
    border-color: ${t(o[0],-2)} #fff;
    box-shadow: -1px 1px 1px rgb(0 0 0 / 5%);
    content: '';
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['box-10'] = (function(o){
    const i = {id:10,name:{ja:"テープで貼られてる風",en:"Looks like it's taped on"},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.BLUE_LIGHT},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="box-010">
    <span>タイトル</span>
    <p>タイトルをテープ風にしたボックス。立体的にすることで、可愛らしさがありながらかなり目立つデザインになっています。</p>
</div>`,css:`.box-010 {
    position: relative;
    max-width: 400px;
    margin: 1.5em auto;
    padding: 2.5em 1.5em 1.5em;
    box-shadow: 0 2px 3px rgb(0 0 0 / 20%);
    background-color: ${e[0]};
    color: ${e[1]};
}

.box-010 span {
    position: absolute;
    top: -15px;
    transform: translateX(-.3em) rotate(-5deg);
    padding: .5em 2em;
    border-right: 2px dotted rgb(0 0 0 / 10%);
    border-left: 2px dotted rgb(0 0 0 / 10%);
    box-shadow: 0 0 5px rgb(0 0 0 / 20%);
    background-color: rgb(255 255 255 / 40%);
    font-weight: 600;
}

.box-010 p {
    margin: 0;
}`}}};
    return function(params){ return i.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-15'] = (function(o){
    const d = {id:15,name:{ja:"クリップ風",en:"Clip style"},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.BLUE_LIGHT},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="box-015">
    右上にクリップ風の装飾をしたボックス。ボックス・クリップ両方に影を付けることで、よりリアリティを出しています。
</div>`,css:`.box-015 {
    position: relative;
    max-width: 400px;
    margin: 1em auto;
    padding: 1em 2.5em 1em 1.5em;
    border-radius: 3px;
    box-shadow: 0 2px 3px rgb(0 0 0 / 20%);
    background-color: ${e[0]};
    color: ${e[1]};
}

.box-015::before,
.box-015::after {
    position: absolute;
    content: '';
}

.box-015::before {
    top: -15px;
    right: 10px;
    height: 50px;
    width: 15px;
    border: 3px solid #999;
    border-radius: 10px;
    box-shadow: 1px 1px 2px rgb(0 0 0 / 30%);
    transform: rotate(10deg);
}

.box-015::after {
    top: 0;
    width: 10px;
    right: 20px;
    border: solid 5px ${e[0]};
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-1'] = (function(i){
    const c = {id:1,name:{ja:"ウィンドウ風",en:"Like window"},inputs:{colors:[{legend:{ja:"バーの色",en:"Bar color"},defaultValue:i.COLOR.SILVER}]},codeFunc({colors:o}){return{html:`<div  class="box-001">
    <svg class="window-bar" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ウインドウのボタン">
        <circle cx="25" cy="12" r="5.5" fill="#f48384"/>
        <circle cx="45" cy="12" r="5.5" fill="#fbd172"/>
        <circle cx="65" cy="12" r="5.5" fill="#82c880"/>
    </svg>
    <p>ウィンドウ風のボックス。Webサイトのキャプチャやソースコードなどを囲むのにおすすめです。</p>
</div>`,css:`.box-001 {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
    padding: calc(1em + 25px) 1.5em 1em;
    border: 2px solid ${o[0]};
    border-radius: 5px;
    overflow: auto;
}

.box-001 svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 25px;
    background-color: ${o[0]};
}

.box-001 p {
    margin: 0;
    padding: 0;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-3'] = (function(e){
    const d = {id:3,name:{ja:"方眼紙風",en:"Graph paper style"},options:{bgColor:e.COLOR.SILVER},inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc({colors:a}){return{html:'<div class="box-003">背景を方眼紙風にしたボックス。かわいい系のサイトと相性が良く、背景が白以外の箇所で利用するとより効果的です。</div>',css:`.box-003 {
    max-width: 400px;
    margin: 0 auto;
    padding: 1em 1.5em;
    box-shadow: 0 4px 4px rgb(0 0 0 / 5%), 0 2px 3px -2px rgb(0 0 0 / 1%);
    background-image: linear-gradient(transparent calc(100% - 1px), #e6edf3 50%, #e6edf3), linear-gradient(90deg, transparent calc(100% - 1px), #e6edf3 50%, #e6edf3);
    background-size: 15px 15px;
    background-repeat: repeat;
    background-color: #ffffff;
    color: ${a[0]};
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['box-2'] = (function(i){
    const x = {id:2,name:{ja:"iPhone風",en:"iPhone style"},inputs:{colors:[{legend:{ja:"端末の色",en:"Device color"},defaultValue:"#303030"}]},codeFunc({colors:o}){return{html:`<div  class="box-002">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 25" fill="#3c3c3c">
        <circle cx="22.5" cy="7.5" r="5"/>
        <circle cx="37.5" cy="7.5" r="5"/>
        <circle cx="52.5" cy="7.5" r="5"/>
        <circle cx="67.5" cy="7.5" r="5"/>
    </svg>
    <!-- 囲みたい画像を指定してください -->
    <img src="${i.IMG.CATCH}" alt=""/>
</div>`,css:`.box-002 {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 168px;
    height: 360px;
    margin: 0 auto;
    overflow: hidden;
    border: 8px solid ${o[0]};
    border-radius: 25px;
    box-sizing: content-box;
    box-shadow: 0 15px 30px -7px rgba(0, 12, 66, .2);
    background: #303030;
}

.box-002::after {
    position: absolute;
    bottom: 5px;
    width: 60px;
    height: 3px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, .8);
    content: '';
}

.box-002 svg {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 60px;
    height: 15px;
    border-radius: 0 0 15px 15px;
    background-color: ${o[0]};
}

.box-002 img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}`}}};
    return function(params){ return x.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-4'] = (function(a){
    const p = {id:4,name:{ja:"回転する長方形",en:"Rotating rectangle"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"長方形の色",en:"Rectangle color"},defaultValue:a.COLOR.BLUE}]},codeFunc({colors:t}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48" fill="${t[0]}">
    <path d="M14 0 H18 V8 H14 z" transform="rotate(0 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M14 0 H18 V8 H14 z" transform="rotate(45 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0.125s" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M14 0 H18 V8 H14 z" transform="rotate(90 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0.25s" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M14 0 H18 V8 H14 z" transform="rotate(135 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0.375s" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M14 0 H18 V8 H14 z" transform="rotate(180 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0.5s" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M14 0 H18 V8 H14 z" transform="rotate(225 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0.625s" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M14 0 H18 V8 H14 z" transform="rotate(270 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0.75s" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M14 0 H18 V8 H14 z" transform="rotate(315 16 16)" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" begin="0.875s" dur="1s" repeatCount="indefinite"/>
    </path>
</svg>`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-7'] = (function(e){
    const n = {id:7,name:{ja:"回転する円",en:"Rotating circle"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"円の色",en:"Circle color"},defaultValue:e.COLOR.BLUE}]},codeFunc({colors:t}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="${t[0]}">
    <circle cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0"/>
    </circle>
    <circle transform="rotate(45 12 12)" cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin=".125s"/>
    </circle>
    <circle transform="rotate(90 12 12)" cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin=".25s"/>
    </circle>
    <circle transform="rotate(135 12 12)" cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin=".375s"/>
    </circle>
    <circle transform="rotate(180 12 12)" cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin=".5s"/>
    </circle>
    <circle transform="rotate(225 12 12)" cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin=".625s"/>
    </circle>
    <circle transform="rotate(270 12 12)" cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin=".75s"/>
    </circle>
    <circle transform="rotate(315 12 12)" cx="12" cy="2" r="2" opacity=".1">
        <animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin=".875s"/>
    </circle>
</svg>`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-2'] = (function(t){
    const l = {id:2,name:{ja:"拡大縮小しながら回転する円",en:"Circle that rotates while scaling"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"円の色",en:"Circle color"},defaultValue:t.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="${e[0]}">
    <circle cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin="0"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(45 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".125s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(90 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".25s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(135 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".375s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(180 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".5s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(225 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".625s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(270 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".75s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(315 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".875s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
    <circle transform="rotate(180 12 12)" cx="12" cy="2" r="0">
        <animate attributeName="r" values="0;2;0;0" dur="1s" repeatCount="indefinite" begin=".5s"
                 keySplines=".2 .2 .4 .8;.2 .2 .4 .8;.2 .2 .4 .8" calcMode="spline"/>
    </circle>
</svg>`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-13'] = (function(t){
    const l = {id:13,name:{ja:"近付きながら回転する円",en:"Circle that rotates as it approaches"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"円の色",en:"Circle color"},defaultValue:t.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="${e[0]}">
    <circle cx="12" cy="3" r="3">
        <animate attributeName="cx" values="12;21;3;12" calcMode="linear" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="3;21;21;3" calcMode="linear" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="21" cy="21" r="3">
        <animate attributeName="cx" values="21;3;12;21" calcMode="linear" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="21;21;3;21" calcMode="linear" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="3" cy="21" r="3">
        <animate attributeName="cx" values="3;12;21;3" calcMode="linear" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="21;3;21;21" calcMode="linear" dur="2.2s" repeatCount="indefinite"/>
    </circle>
</svg>`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-1'] = (function(e){
    const l = {id:1,name:{ja:"なぞられる輪",en:"Traced ring"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"前輪の色",en:"Front wheel color"},defaultValue:e.COLOR.BLUE},{legend:{ja:"後輪の色",en:"Rear wheel color"},defaultValue:e.COLOR.SILVER}]},codeFunc({colors:t}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
    <path fill="${t[1]}"
          d="M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12,12-5.4,12-12S18.6,0,12,0m0,3c5,0,9,4,9,9s-4,9-9,9S3,17,3,12,7,3,12,3"/>
    <path fill="${t[0]}" d="M12,0c6.6,0,12,5.4,12,12h-3c0-5-4-9-9-9V0Z">
        <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite"
                          from="0 12 12" to="360 12 12" dur="1s"/>
    </path>
</svg>`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-10'] = (function(t){
    const s = {id:10,name:{ja:"長さを変えながら回転する輪",en:"Ring that rotates while changing its length"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"輪の色",en:"Ring color"},defaultValue:t.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
    <circle cx="12" cy="12" r="10" fill="none" stroke="${e[0]}"
            stroke-width="2" stroke-dasharray="63" stroke-linecap="round">
        <animate attributeName="stroke-dashoffset" values="63;16;63" keyTimes="0;.5;1"
                 keySplines=".42 0 .58 1;.42 0 .58 1;" calcMode="spline"
                 dur="1.4s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="rotate" values="0,12,12;135,12,12;450,12,12"
                          keySplines=".42 0 .58 1;.42 0 .58 1;" calcMode="spline"
                          dur="1.4s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="rotate" from="0,12,12" to="270,12,12"
                          calcMode="linear" dur="1.4s" repeatCount="indefinite" additive="sum"/>
    </circle>
</svg>`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-14'] = (function(e){
    const m = {id:14,name:{ja:"時計風",en:"Clock style"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"輪と針の色",en:"Ring and needle color"},defaultValue:e.COLOR.BLUE}]},codeFunc({colors:t}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="${t[0]}">
    <circle cx="12" cy="12" r="11" fill="none" stroke="${t[0]}"/>
    <rect x="11.5" y="3" width="1" height="9">
        <animateTransform attributeName="transform" type="rotate"
                          from="0,12,12" to="360,12,12"
                          dur="2s" calcMode="linear" repeatCount="indefinite"/>
    </rect>
    <rect x="11.5" y="6" width="1" height="6.5">
        <animateTransform attributeName="transform" type="rotate"
                          from="0,12,12" to="360,12,12"
                          dur="8s" calcMode="linear" repeatCount="indefinite"/>
    </rect>
</svg>`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-11'] = (function(r){
    const l = {id:11,name:{ja:"円の中で回転する円",en:"Circle rotating within a circle"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"円の色",en:"Circle color"},defaultValue:r.COLOR.BLUE}]},codeFunc({colors:t}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
    <circle cx="12" cy="12" r="12" fill="${t[0]}"/>
    <circle cx="12" cy="5" r="4" fill="#fff">
        <animateTransform attributeName="transform" type="rotate"
                          from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
    </circle>
</svg>`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-8'] = (function(i){
    const o = {id:8,name:{ja:"バウンドする円",en:"Bouncing circle"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"円の色",en:"circle Color"},defaultValue:i.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="${e[0]}">
    <circle cx="12" cy="12" r="12" opacity=".5">
        <animate attributeName="r" values="0;12;0" keySplines="0.42 0.0 0.58 1.0"
                 dur="2s" repeatCount="indefinite" begin="0"/>
    </circle>
    <circle cx="12" cy="12" r="0" opacity=".5">
        <animate attributeName="r" values="0;12;0" keySplines="0.42 0.0 0.58 1.0"
                 dur="2s" repeatCount="indefinite" begin="1s"/>
    </circle>
</svg>`}}};
    return function(params){ return o.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-12'] = (function(t){
    const c = {id:12,name:{ja:"波紋を出す円",en:"Circle that makes ripples"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"円の色",en:"Circle color"},defaultValue:t.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="${e[0]}">
    <circle cx="12" cy="12" r="0">
        <animate attributeName="opacity" values="0;1;0"
                 keyTimes="0;.05;1" calcMode="linear"
                 dur="1s" repeatCount="indefinite"/>
        <animate attributeName="r" from="0" to="12"
                 dur="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="12" cy="12" r="0">
        <animate attributeName="opacity" values="0;1;0"
                 keyTimes="0;.05;1" calcMode="linear"
                 dur="1s" begin=".3s" repeatCount="indefinite"/>
        <animate attributeName="r" from="0" to="12"
                 dur="1s" begin=".3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="12" cy="12" r="0">
        <animate attributeName="opacity" values="0;1;0"
                 keyTimes="0;.05;1" calcMode="linear"
                 dur="1s" begin=".6s" repeatCount="indefinite"/>
        <animate attributeName="r" from="0" to="12"
                 dur="1s" begin=".6s" repeatCount="indefinite"/>
    </circle>
</svg>`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-6'] = (function(t){
    const u = {id:6,name:{ja:"回転する正方形",en:"Rotating square"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"活性時の色",en:"Active color"},defaultValue:t.COLOR.BLUE},{legend:{ja:"非活性時の色",en:"Inactive color"},defaultValue:t.COLOR.SILVER}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="${e[1]}">
        <rect x="0" y="0" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0s" calcMode="discrete"></animate>
        </rect>
        <rect x="17" y="0" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0.125s" calcMode="discrete"></animate>
        </rect>
        <rect x="34" y="0" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0.25s" calcMode="discrete"></animate>
        </rect>
        <rect x="0" y="17" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0.875s" calcMode="discrete"></animate>
        </rect>
        <rect x="34" y="17" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0.375s" calcMode="discrete"></animate>
        </rect>
        <rect x="0" y="34" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0.75s" calcMode="discrete"></animate>
        </rect>
        <rect x="17" y="34" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0.625s" calcMode="discrete"></animate>
        </rect>
        <rect x="34" y="34" width="14" height="14" fill="#e6edf3">
            <animate attributeName="fill" values="${e[0]};${e[1]};${e[1]}" keyTimes="0;0.125;1" dur="1s"
                     repeatCount="indefinite" begin="0.5s" calcMode="discrete"></animate>
        </rect>
    </svg>`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-15'] = (function(a){
    const p = {id:15,name:{ja:"回転する立方体",en:"Rotating cube"},imgFormat:"gif",inputs:{colors:[{legend:{ja:"立方体の色",en:"Cube color"},defaultValue:a.COLOR.BLUE}]},codeFunc({colors:t}){return{html:`<div class="loading-15">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
</div>`,css:`.loading-15 {
    transform-style: preserve-3d;
    animation: animation-loading-15 3s infinite forwards;
}

.loading-15 span {
    position: absolute;
    top: -24px;
    left: -24px;
    width: 48px;
    height: 48px;
    border: 1px solid ${t[0]};
    background-color: #fff;
}

.loading-15 span:nth-of-type(1) {
    transform: translateZ(24px);
}

.loading-15 span:nth-of-type(2) {
    transform: rotateY(180deg) translateZ(24px);
}

.loading-15 span:nth-of-type(3) {
    transform: rotateY(-90deg) translateZ(24px);
}

.loading-15 span:nth-of-type(4) {
    transform: rotateY(90deg) translateZ(24px);
}

.loading-15 span:nth-of-type(5) {
    transform: rotateX(-90deg) translateZ(24px)
}

.loading-15 span:nth-of-type(6) {
    transform: rotateX(90deg) translateZ(24px);
}

@keyframes animation-loading-15 {
    0% {
        transform: rotateY(0deg) rotateZ(0deg);
    }
    20% {
        transform: rotateY(90deg) rotateZ(0deg);
    }
    40% {
        transform: rotateX(45deg) rotateZ(45deg);
    }
    60% {
        transform: rotateX(90deg) rotateY(180deg) rotateX(90deg);
    }
    80% {
        transform: rotateX(310deg) rotateZ(230deg)
    }
    100% {
        transform: rotateX(360deg) rotateZ(360deg)
    }
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-9'] = (function(t){
    const l = {id:9,name:{ja:"2つの周期で動くバー",en:"Bar moving in two periods"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"前のバーの色",en:"Front bar color"},defaultValue:t.COLOR.BLUE},{legend:{ja:"後ろのバーの色",en:"Back bar color"},defaultValue:t.COLOR.SILVER}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 5" width="150" height="5">
    <rect x="0" y="0" rx="2" ry="2" width="150" height="5" fill="${e[1]}"/>
    <rect x="0" y="0" rx="2" ry="2" width="150" height="5" fill="${e[0]}" transform="scale(0,1)">
        <animateTransform attributeName="transform" type="translate"
                          values="-75,0;-20,0;50,0;250,0"
                          keyTimes="0;.3;.5;1"
                          keySplines="0 0 1 1;.3 .3 .8 .7;.4 .6 .6 .9"
                          dur="2s" repeatCount="indefinite" calcMode="spline"/>
        <animateTransform attributeName="transform" type="scale"
                          values=".1,1;.5,1;.7,1;.1,1"
                          keyTimes="0;.4;.8;1"
                          keySplines="0 0 1 1;.3 .1 .8 1;.1 .1 .6 1"
                          dur="2s" repeatCount="indefinite" calcMode="spline" additive="sum"/>
    </rect>
    <rect x="0" y="0" rx="2" ry="2" width="150" height="5" fill="${e[0]}" transform="scale(0,1)">
        <animateTransform attributeName="transform" type="translate"
                          values="-50,0;-50,0;-50,0;165,0"
                          keyTimes="0;.2;.6;1"
                          keySplines="0 0 1 1;.5 0 .7 .5;.3 .4 .6 1"
                          dur="2s" repeatCount="indefinite" calcMode="spline" begin=".5s"/>
        <animateTransform attributeName="transform" type="scale"
                          values=".1,1;.1,1;.7,1;.1,1"
                          keyTimes="0;.4;.7;1"
                          keySplines="0 0 1 1;.3 .1 .8 1;.1 .1 .6 1"
                          dur="2s" repeatCount="indefinite" calcMode="spline" additive="sum" begin=".5s"/>
    </rect>
</svg>`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-3'] = (function(t){
    const s = {id:3,name:{ja:"縦に伸びる棒 (5本)",en:"Vertically extending bar (5 pieces)"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"バーの色",en:"Bar color"},defaultValue:t.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="72" height="72" fill="${e[0]}">
    <path transform="translate(2)" d="M0 12 V20 H4 V12z">
        <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
                 dur="1.2s" calcMode="spline" begin="0" repeatCount="indefinite"
                 keytimes="0;.2;.5;1" keySplines=".2 .2 .4 .8;.2 0.6 .4 .8;.2 .8 .4 .8"/>
    </path>
    <path transform="translate(8)" d="M0 12 V20 H4 V12z">
        <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
                 dur="1.2s" calcMode="spline" begin=".2" repeatCount="indefinite"
                 keytimes="0;.2;.5;1" keySplines=".2 .2 .4 .8;.2 0.6 .4 .8;.2 .8 .4 .8"/>
    </path>
    <path transform="translate(14)" d="M0 12 V20 H4 V12z">
        <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
                 dur="1.2s" calcMode="spline" begin=".4" repeatCount="indefinite"
                 keytimes="0;.2;.5;1" keySplines=".2 .2 .4 .8;.2 0.6 .4 .8;.2 .8 .4 .8"/>
    </path>
    <path transform="translate(20)" d="M0 12 V20 H4 V12z">
        <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
                 dur="1.2s" calcMode="spline" begin=".6" repeatCount="indefinite"
                 keytimes="0;.2;.5;1" keySplines=".2 .2 .4 .8;.2 0.6 .4 .8;.2 .8 .4 .8"/>
    </path>
    <path transform="translate(26)" d="M0 12 V20 H4 V12z">
        <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
                 dur="1.2s" calcMode="spline" begin=".8" repeatCount="indefinite"
                 keytimes="0;.2;.5;1" keySplines=".2 .2 .4 .8;.2 0.6 .4 .8;.2 .8 .4 .8"/>
    </path>
</svg>`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-5'] = (function(a){
    const e = {id:5,name:{ja:"波状的に上下する文字",en:"Letters that rise and fall in a wavy manner"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:a.COLOR.BLUE}]},codeFunc({colors:n}){return{html:`<div class="loading-5">
    <p>
        <span>L</span>
        <span>o</span>
        <span>a</span>
        <span>d</span>
        <span>i</span>
        <span>n</span>
        <span>g</span>
        <span>.</span>
        <span>.</span>
        <span>.</span>
    </p>
</div>`,css:`.loading-5 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-5 span {
    display: inline-block;
    color: ${n[0]};
    font-weight: 600;
    font-size: 1.5em;
    animation: animation-loading-5 1s infinite;
}

.loading-5 span:nth-of-type(2) {
    animation-delay: .1s;
}

.loading-5 span:nth-of-type(3) {
    animation-delay: .2s;
}

.loading-5 span:nth-of-type(4) {
    animation-delay: .3s;
}

.loading-5 span:nth-of-type(5) {
    animation-delay: .4s;
}

.loading-5 span:nth-of-type(6) {
    animation-delay: .5s;
}

.loading-5 span:nth-of-type(7) {
    animation-delay: .6s;
}

.loading-5 span:nth-of-type(8) {
    animation-delay: .7s;
}

.loading-5 span:nth-of-type(9) {
    animation-delay: .8s;
}

.loading-5 span:nth-of-type(10) {
    animation-delay: .9s;
}

@keyframes animation-loading-5 {
    50% {
        transform: translateY(10px);
    }
}`}}};
    return function(params){ return e.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['loading-16'] = (function(o, t){
    const p = {id:16,name:{ja:"記事の読み込み",en:"Loading articles"},imgFormat:"gif",comment:{ja:"記事一覧などでコンテンツを読み込む際に使えるローティングアニメーションです。幅や行数は使用箇所に応じて適宜調整してみてください。",en:"This is a loading animation that can be used when loading content in article lists, etc. Please adjust the width and number of lines as appropriate depending on where you use it."},inputs:{colors:[{legend:o.LEGEND.BASE_COLOR,defaultValue:"#eeeeee"}],ranges:[{legend:{ja:"行数",en:"Number of lines"},defaultValue:3,min:2,max:10,step:1,unit:{ja:"行",en:"lines"}}]},codeFunc({colors:i,ranges:a}){let e='<div class="loading-16">';for(let n=0;n<a[0];n++)e+=`
    <div></div>`;return e+=`
</div>
`,e+=e,{html:e,css:`.loading-16 {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    margin-bottom: 1em;
}

.loading-16::before {
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 3px;
    background-color: ${i[0]};
    content: '';
}

.loading-16 div {
    width: 300px;
    height: 13px;
    margin-left: 43px;
    border-radius: 3px;
    background-color: ${i[0]};
    background-image: linear-gradient(to right, ${i[0]} 5%, ${t(i[0],-1)} 15%, ${i[0]} 30%);
    animation: anim-loading-16 2s linear infinite;
}

@keyframes anim-loading-16 {
    from {
        background-position-x: -300px;
    }
    to {
        background-position-x: 300px;
    }
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['list-1'] = (function(t, l){
    const p = {id:1,name:{ja:"スタンダード",en:"Standard"},comment:{ja:"箇条書きに欠かせない点のみを付けた、とてもシンプルなリスト。シンプルイズベストということで、個人的にイチオシのパーツです。",en:"A very simple list with only the essential bullet points. Simple is best, so this is my personal favorite part."},inputs:{colors:[{legend:t.LEGEND.BASE_COLOR,defaultValue:t.COLOR.BLUE}],radios:[l.RADIO.LIST_TYPE,l.RADIO.BORDER_PRESENCE]},codeFunc({colors:e,radios:i}){return{html:`<${i[0]} class="list-1">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${i[0]}>`,css:`.list-1 {
    list-style-type: disc;${i[1]?`
    padding: 1em 1em 1em 2.5em;
    border: 2px solid ${e[0]};`:""}
}

.list-1 li {
    padding: .3em .3em .3em 0;
}

.list-1 li::marker {
    color: ${e[0]};
    font-size: 1.1em;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-9'] = (function(l, e){
    const p = {id:9,name:{ja:"下線あり",en:"With underline"},inputs:{colors:[{legend:l.LEGEND.BASE_COLOR,defaultValue:l.COLOR.BLUE}],radios:[e.RADIO.LIST_TYPE,e.RADIO.BORDER_PRESENCE]},codeFunc({colors:i,radios:t}){return{html:`<${t[0]} class="list-9">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${t[0]}>`,css:`.list-9 {
    list-style-type: disc;
    list-style-position: inside;${t[1]?`
    padding: 1em;
    border: 2px solid ${i[0]};`:""}
}

.list-9 li {
    padding: .5em;
}

.list-9 li:not(:last-child) {
    border-bottom: 1px dashed ${i[0]};
}

.list-9 li::marker {
    color: ${i[0]};
    font-size: 1.1em;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-11'] = (function(t, l){
    const d = {id:11,name:{ja:"引用風",en:"Quote style"},comment:{ja:"左に枠線を付けた、引用ボックスでよく見るデザインです。",en:"This is a design often seen in quote boxes, with a border on the left."},inputs:{colors:[{legend:{ja:"左枠線の色",en:"Left border color"},defaultValue:t.COLOR.BLUE},{legend:t.LEGEND.BG_COLOR,defaultValue:t.COLOR.SILVER}],radios:[l.RADIO.LIST_TYPE]},codeFunc({colors:e,radios:i}){return{html:`<${i[0]} class="list-11">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${i[0]}>`,css:`.list-11 {
    list-style-type: disc;
    padding: 1em 1em 1em 2.5em;
    border-left: 5px solid ${e[0]};
    background-color: ${e[1]};
}

.list-11 li {
    padding: .3em .3em .3em 0;
}

.list-11 li::marker {
    color: ${e[0]};
    font-size: 1.1em;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-8'] = (function(e, o){
    const r = {id:8,name:{ja:"タイトル (小)",en:"Title (small)"},comment:{ja:"枠線の上にタイトルを置いたリストです。タイトルをより目立たせたい場合はフォントサイズを調整するのもアリかもしれません。",en:"A list with a title above the border. If you want the title to stand out more, you may want to adjust the font size."},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[o.RADIO.LIST_TYPE]},codeFunc({colors:t,radios:i}){return{html:`<div class="list-8">
    <div>タイトル</div>
    <${i[0]}>
        <li>リストの項目1</li>
        <li>リストの項目2</li>
        <li>リストの項目3</li>
    </${i[0]}>
</div>`,css:`.list-8 {
    position: relative;
    padding: 1.5em 1em 1em 2.5em;
    border: 2px solid ${t[0]};
}

.list-8 > div {
    position: absolute;
    top: -.75em;
    left: 1em;
    padding: 0 .5em;
    background-color: #fff;
    color: ${t[0]};
    font-weight: 600;
}

.list-8 ${i[0]} {
    list-style-type: disc;
    margin: 0;
    padding: 0;
}

.list-8 li {
    padding: .3em .3em .3em 0;
}

.list-8 li::marker {
    color: ${t[0]};
    font-size: 1.1em;
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-4'] = (function(e, l){
    const d = {id:4,name:{ja:"タイトル (大)",en:"Title (large)"},comment:{ja:"上部にタイトルを付けたリストです。多用するとくどく思われてしまうので、よりリストを強調させたい場合のみに使うのがおすすめです。",en:"This is a list with a title at the top. If you use it too often, it will seem tedious, so we recommend using it only when you want to emphasize the list."},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[l.RADIO.LIST_TYPE]},codeFunc({colors:i,radios:t}){return{html:`<div class="list-4">
    <div>タイトル</div>
    <${t[0]}>
        <li>リストの項目1</li>
        <li>リストの項目2</li>
        <li>リストの項目3</li>
    </${t[0]}>
</div>`,css:`.list-4 {
    border: 2px solid ${i[0]};
}

.list-4 div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 10px 0;
    background-color: ${i[0]};
    color: #fff;
    font-weight: 600;
}

.list-4 ${t[0]} {
    list-style-type: disc;
    margin: 0;
    padding: 1em 1em 1em 2.5em;
}

.list-4 li {
    padding: .3em .3em .3em 0;
}

.list-4 li::marker {
    color: ${i[0]};
    font-size: 1.1em;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-5'] = (function(l, t){
    const s = {id:5,name:{ja:"タイトル (大) & 背景色",en:"Title (large) & background color"},inputs:{colors:[{legend:{ja:"左枠線の色",en:"Left border color"},defaultValue:l.COLOR.BLUE},{legend:l.LEGEND.BG_COLOR,defaultValue:l.COLOR.SILVER}],radios:[t.RADIO.LIST_TYPE]},codeFunc({colors:i,radios:e}){return{html:`<div class="list-5">
    <div>タイトル</div>
    <${e[0]}>
        <li>リストの項目1</li>
        <li>リストの項目2</li>
        <li>リストの項目3</li>
    </${e[0]}>
</div>`,css:`.list-5 {
    background-color: ${i[1]};
}

.list-5 div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 10px 0;
    background-color: ${i[0]};
    color: #fff;
    font-weight: 600;
}

.list-5 ${e[0]} {
    list-style-type: disc;
    margin: 0;
    padding: 1em 1em 1em 2.5em;
}

.list-5 li {
    padding: .3em .3em .3em 0;
}

.list-5 li::marker {
    color: ${i[0]};
    font-size: 1.1em;
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-2'] = (function(l, t){
    const c = {id:2,name:{ja:"番号に背景",en:"background with number"},comment:{ja:"数字を囲んだリストです。四角 or 円にするか、お好みで形状を選んでみてください。",en:"A list of numbers. Choose a square or circle, or whatever shape you like."},inputs:{colors:[{legend:l.LEGEND.BASE_COLOR,defaultValue:l.COLOR.BLUE}],radios:[t.RADIO.LIST_TYPE,t.RADIO.BORDER_PRESENCE,{legend:{ja:"番号の形状",en:"Number shape"},choices:[{label:{ja:"円",en:"Circle"},value:!0},{label:{ja:"四角",en:"Square"},value:!1}]}]},codeFunc({colors:i,radios:e}){return{html:`<${e[0]} class="list-2">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${e[0]}>`,css:`.list-2 {${e[1]?`
    list-style-type: none;
    padding: 1em;
    border: 2px solid ${i[0]};`:""}
    counter-reset: li;
}

.list-2 li {
    display: flex;
    align-items: center;
    padding: .3em;
}

.list-2 li::before {
    display: inline-block;
    min-width: 1.7em;
    margin-right: 5px;${e[2]?`
    border-radius: 50%;`:""}
    background-color: ${i[0]};
    color: #fff;
    font-weight: bold;
    font-size: .75em;
    line-height: 1.7em;
    text-align: center;
    content: counter(li);
    counter-increment: li;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-7'] = (function(e, l){
    const n = {id:7,name:{ja:"矢印",en:"Arrow"},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[l.RADIO.LIST_TYPE,l.RADIO.BORDER_PRESENCE]},codeFunc({colors:t,radios:i}){return{html:`<${i[0]} class="list-7">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${i[0]}>`,css:`.list-7 {
    list-style-type: none;${i[1]?`
    padding: 1em;
    border: 2px solid ${t[0]};`:""}
}

.list-7 li {
    display: flex;
    align-items: center;
    gap: 0 10px;
    padding: .3em;
}

.list-7 li::before {
    transform: rotate(-45deg);
    width: .4em;
    height: .4em;
    border-bottom: 3px solid ${t[0]};
    border-right: 3px solid ${t[0]};
    content: '';
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-12'] = (function(i, l){
    const n = {id:12,name:{ja:"矢印 (円形)",en:"Arrow (circular)"},inputs:{colors:[{legend:i.LEGEND.BASE_COLOR,defaultValue:i.COLOR.BLUE}],radios:[l.RADIO.LIST_TYPE,l.RADIO.BORDER_PRESENCE]},codeFunc({colors:t,radios:e}){return{html:`<${e[0]} class="list-12">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${e[0]}>`,css:`.list-12 {
    list-style-type: none;${e[1]?`
    padding: 1em;
    border: 2px solid ${t[0]};`:""}
}

.list-12 li {
    display: flex;
    align-items: center;
    gap: 0 10px;
    position: relative;
    padding: .3em .3em .3em 1.5em;
}

.list-12 li::before,
.list-12 li::after {
    position: absolute;
    content: '';
}

.list-12 li::before {
    left: 0;
    width: 1.2em;
    height: 1.2em;
    border-radius: 50%;
    background-color: ${t[0]};
}

.list-12 li::after {
    left: .6em;
    transform: translateX(-75%) rotate(-45deg);
    width: .3em;
    height: .3em;
    border-bottom: 2px solid #fff;
    border-right: 2px solid #fff;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-3'] = (function(e, l){
    const d = {id:3,name:{ja:"チェックマーク",en:"Check mark"},comment:{ja:"チェックマークを付けた、Todoリストのようにも見えるリスト。比較的シンプルなデザインでありながらユーザーの目を引きやすいのが特徴です。",en:"A list with check marks that looks like a to-do list. Although it has a relatively simple design, it is easy to catch the user's attention."},inputs:{colors:[{legend:e.LEGEND.BASE_COLOR,defaultValue:e.COLOR.BLUE}],radios:[l.RADIO.LIST_TYPE,l.RADIO.BORDER_PRESENCE]},codeFunc({colors:t,radios:i}){return{html:`<${i[0]} class="list-3">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${i[0]}>`,css:`.list-3 {
    list-style-type: none;${i[1]?`
    padding: 1em;
    border: 2px solid ${t[0]};`:""}
}

.list-3 li {
    display: flex;
    align-items: center;
    gap: 0 5px;
    padding: .3em;
}

.list-3 li::before {
    display: inline-block;
    width: 10px;
    height: 5px;
    border-bottom: 2px solid ${t[0]};
    border-left: 2px solid ${t[0]};
    transform: rotate(-45deg) translateY(-1.5px);
    content: '';
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-10'] = (function(i, t){
    const p = {id:10,name:{ja:"絵文字",en:"Emoji"},comment:{ja:"絵文字を使うことで可愛さが増したリスト。ぜひお好きな絵文字を指定してみてください。",en:"This list is made even more cute by using emojis. Please feel free to specify your favorite emoji."},inputs:{colors:[{legend:i.LEGEND.BASE_COLOR,defaultValue:i.COLOR.BLUE}],radios:[t.RADIO.LIST_TYPE,t.RADIO.BORDER_PRESENCE]},codeFunc({colors:l,radios:e}){return{html:`<${e[0]} class="list-10">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${e[0]}>`,css:`.list-10 {
    list-style-type: '👉';${e[1]?`
    padding: 1em 1em 1em 2.5em;
    border: 2px solid ${l[0]};`:""}
}

.list-10 li {
    padding: .3em;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-6'] = (function(t, o){
    const m = {id:6,name:{ja:"見出し風",en:"Heading style"},comment:{ja:"背景と左に枠線を付けた、見出し風のリストです。見た目的にもかなり目立つ部類なので、リストを強調したい時に利用するのがおすすめです。",en:"It is a heading-like list with a background and a border on the left. It's a category that stands out visually, so we recommend using it when you want to emphasize a list."},inputs:{colors:[{legend:{ja:"左枠線の色",en:"Left border color"},defaultValue:t.COLOR.BLUE},{legend:t.LEGEND.BG_COLOR,defaultValue:t.COLOR.SILVER}],radios:[o.RADIO.LIST_TYPE]},codeFunc({colors:e,radios:i}){return{html:`<${i[0]} class="list-6">
    <li>リストの項目1</li>
    <li>リストの項目2</li>
    <li>リストの項目3</li>
</${i[0]}>`,css:`.list-6 {
    list-style-type: none;
}

.list-6 li {
    margin-bottom: 5px;
    padding: .5em .7em;
    border-left: 5px solid ${e[0]};
    background-color: ${e[1]};
    font-weight: 600;
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_common_list.COMMON);
  root.designInserterPartCodeFuncs['list-13'] = (function(l, i){
    const p = {id:13,name:{ja:"ディレクトリリスト (ツリー構造)",en:"Directory list (tree structure)"},comment:{ja:"ディレクトリ・ファイルやサイトマップを表示する場合におすすめなリスト。フォルダ要素に関しては、spanタグで囲むことでアイコンが左に付くようになります。",en:"Recommended list for displaying directories/files and sitemaps. For folder elements, by surrounding them with span tags, the icon will be placed on the left."},inputs:{colors:[{legend:l.LEGEND.BASE_COLOR,defaultValue:l.COLOR.BLACK_TEXT},{legend:{ja:"アイコンの色",en:"Icon color"},defaultValue:l.COLOR.BLUE}]},codeFunc({colors:e}){return{html:`<ul class="list-13">
    <li>
        <span>folder1</span>
        <ul>
            <li>index.html</li>
            <li>style.css</li>
        </ul>
    </li>
    <li>
        <span>folder2</span>
        <ul>
            <li>
                <span>folder2-1</span>
                <ul>
                    <li>index.html</li>
                    <li>style.css</li>
                </ul>
            </li>
        </ul>
    </li>
</ul>`,css:`.list-13 {
    padding: 1em;
}

.list-13 li {
    list-style-type: none;
    position: relative;
    padding: .3em .3em .3em 1em;
    color: ${e[0]};
}

.list-13 li::before,
.list-13 li::after {
    position: absolute;
    left: 0;
    background-color: ${e[0]};
    content: '';
}

.list-13 li::before {
    top: 1em;
    width: 10px;
    height: 1px;
}

.list-13 li::after {
    top: 0;
    width: 1px;
    height: 100%;
}

.list-13 li:last-child::after {
    height: 1em;
}

.list-13 span {
    display: flex;
    align-items: center;
}

.list-13 span::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 5px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5Z' fill='%23${i(e[1])}'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['balloon-1'] = (function(o){
    const r = {id:1,name:{ja:"下向き",en:"Downward"},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.SILVER},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:`<div class="balloon-001">
    単色のシンプルな吹き出し。背景色を変えることで、どんなサイトにも馴染ませることができます。
</div>`,css:`.balloon-001 {
    display: flex;
    justify-content: center;
    position: relative;
    max-width: 300px;
    margin-bottom: 15px;
    padding: .8em 1.2em;
    border-radius: 5px;
    background-color: ${t[0]};
    color: ${t[1]};
}

.balloon-001::before {
    position: absolute;
    bottom: -15px;
    width: 30px;
    height: 15px;
    background-color: ${t[0]};
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-2'] = (function(o){
    const p = {id:2,name:{ja:"上向き",en:"Upward"},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.SILVER},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:`<div class="balloon-002">
    単色のシンプルな吹き出し。背景色を変えることで、どんなサイトにも馴染ませることができます。
</div>`,css:`.balloon-002 {
    display: flex;
    justify-content: center;
    position: relative;
    max-width: 300px;
    margin-top: 15px;
    padding: .8em 1.2em;
    border-radius: 5px;
    background-color: ${t[0]};
    color: ${t[1]};
}

.balloon-002::before {
    position: absolute;
    top: -15px;
    width: 30px;
    height: 15px;
    background-color: ${t[0]};
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
    content: '';
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-4'] = (function(o){
    const p = {id:4,name:{ja:"左向き",en:"Facing left"},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.SILVER},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="balloon-004">
    単色のシンプルな吹き出し。背景色を変えることで、どんなサイトにも馴染ませることができます。
</div>`,css:`.balloon-004 {
    display: flex;
    align-items: center;
    position: relative;
    max-width: 300px;
    margin-left: 15px;
    padding: .8em 1.2em;
    border-radius: 5px;
    background-color: ${e[0]};
    color: ${e[1]};
}

.balloon-004::before {
    position: absolute;
    left: -15px;
    width: 15px;
    height: 30px;
    background-color: ${e[0]};
    clip-path: polygon(0 50%, 100% 0, 100% 100%);
    content: '';
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-3'] = (function(o){
    const r = {id:3,name:{ja:"右向き",en:"Facing right"},inputs:{colors:[{legend:o.LEGEND.BG_COLOR,defaultValue:o.COLOR.SILVER},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="balloon-003">
    単色のシンプルな吹き出し。背景色を変えることで、どんなサイトにも馴染ませることができます。
</div>`,css:`.balloon-003 {
    display: flex;
    align-items: center;
    position: relative;
    max-width: 300px;
    margin-left: 15px;
    padding: .8em 1.2em;
    border-radius: 5px;
    background-color: ${e[0]};
    color: ${e[1]};
}

.balloon-003::before {
    position: absolute;
    right: -15px;
    width: 15px;
    height: 30px;
    background-color: ${e[0]};
    clip-path: polygon(0 0, 100% 50%, 0 100%);
    content: '';
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-5'] = (function(o){
    const i = {id:5,name:{ja:"下向き",en:"Downward"},inputs:{colors:[{legend:o.LEGEND.BORDER_COLOR,defaultValue:o.COLOR.BLUE},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:t}){return{html:`<div class="balloon-005">
    枠線付きのシンプルな吹き出し。枠線をコントラストの強い色にすると、より目立たせることができます。
</div>`,css:`.balloon-005 {
    display: flex;
    justify-content: center;
    position: relative;
    max-width: 300px;
    margin-bottom: 15px;
    padding: .8em 1.2em;
    border: 3px solid ${t[0]};
    border-radius: 5px;
    background-color: #fff;
    color: ${t[1]};
}

.balloon-005::before,
.balloon-005::after {
    position: absolute;
    bottom: -15px;
    width: 30px;
    height: 15px;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.balloon-005::before {
    background-color: ${t[0]};
}

.balloon-005::after {
    bottom: -11px;
    background-color: #fff;
}`}}};
    return function(params){ return i.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-6'] = (function(o){
    const p = {id:6,name:{ja:"上向き",en:"Upward"},inputs:{colors:[{legend:o.LEGEND.BORDER_COLOR,defaultValue:o.COLOR.BLUE},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="balloon-006">
    枠線付きのシンプルな吹き出し。枠線をコントラストの強い色にすると、より目立たせることができます。
</div>`,css:`.balloon-006 {
    display: flex;
    justify-content: center;
    position: relative;
    max-width: 300px;
    margin-top: 15px;
    padding: .8em 1.2em;
    border: 3px solid ${e[0]};
    border-radius: 5px;
    background-color: #fff;
    color: ${e[1]};
}

.balloon-006::before,
.balloon-006::after {
    position: absolute;
    top: -15px;
    width: 30px;
    height: 15px;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
    content: '';
}

.balloon-006::before {
    background-color: ${e[0]};
}

.balloon-006::after {
    top: -11px;
    background-color: #fff;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-8'] = (function(o){
    const i = {id:8,name:{ja:"左向き",en:"Facing left"},inputs:{colors:[{legend:o.LEGEND.BORDER_COLOR,defaultValue:o.COLOR.BLUE},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:l}){return{html:`<div class="balloon-008">
    枠線付きのシンプルな吹き出し。枠線をコントラストの強い色にすると、より目立たせることができます。
</div>`,css:`.balloon-008 {
    display: flex;
    align-items: center;
    position: relative;
    max-width: 300px;
    margin-left: 15px;
    padding: .8em 1.2em;
    border: 3px solid ${l[0]};
    border-radius: 5px;
    background-color: #fff;
    color: ${l[1]};
}

.balloon-008::before,
.balloon-008::after {
    position: absolute;
    left: -15px;
    width: 15px;
    height: 30px;
    clip-path: polygon(0 50%, 100% 0, 100% 100%);
    content: '';
}

.balloon-008::before {
    background-color: ${l[0]};
}

.balloon-008::after {
    left: -11px;
    background-color: #fff;
}`}}};
    return function(params){ return i.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-7'] = (function(o){
    const n = {id:7,name:{ja:"右向き",en:"Facing right"},inputs:{colors:[{legend:o.LEGEND.BORDER_COLOR,defaultValue:o.COLOR.BLUE},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:l}){return{html:`<div class="balloon-007">
    枠線付きのシンプルな吹き出し。枠線をコントラストの強い色にすると、より目立たせることができます。
</div>`,css:`.balloon-007 {
    display: flex;
    align-items: center;
    position: relative;
    max-width: 300px;
    margin-right: 15px;
    padding: .8em 1.2em;
    border: 3px solid ${l[0]};
    border-radius: 5px;
    background-color: #fff;
    color: ${l[1]};
}

.balloon-007::before,
.balloon-007::after {
    position: absolute;
    right: -15px;
    width: 15px;
    height: 30px;
    clip-path: polygon(0 0, 100% 50%, 0 100%);
    content: '';
}

.balloon-007::before {
    background-color: ${l[0]};
}

.balloon-007::after {
    right: -11px;
    background-color: #fff;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-9'] = (function(o){
    const r = {id:9,name:{ja:"左向き",en:"Facing left"},inputs:{colors:[{legend:{ja:"吹き出しの色",en:"speech bubble color"},defaultValue:o.COLOR.SILVER},{legend:{ja:"アイコン枠線の色",en:"Icon border color"},defaultValue:o.COLOR.SILVER},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="balloon-009">
    <!-- お好きなアイコン画像を指定してください -->
    <img src="${o.IMG.ICON}" alt="" />
    <p>これは会話風の吹き出しです。お好きなアイコン画像を指定できます。</p>
</div>`,css:`.balloon-009 {
    display: flex;
    justify-content: center;
    align-items: start;
    gap: 0 22px;
}

.balloon-009 img {
    max-width: 70px;
    height: 100%;
    border: 3px solid ${e[1]};
    border-radius: 50%;
}

.balloon-009 p {
    position: relative;
    max-width: 300px;
    margin: 3px 0 0;
    padding: .8em 1em;
    border-radius: 5px;
    background-color: ${e[0]};
    color: ${e[2]};
}

.balloon-009 p::before {
    position: absolute;
    left: -15px;
    width: 15px;
    height: 30px;
    background-color: ${e[0]};
    clip-path: polygon(0 50%, 100% 0, 100% 100%);
    content: '';
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-10'] = (function(o){
    const r = {id:10,name:{ja:"右向き",en:"Facing right"},inputs:{colors:[{legend:{ja:"吹き出しの色",en:"speech bubble color"},defaultValue:o.COLOR.SILVER},{legend:{ja:"アイコン枠線の色",en:"Icon border color"},defaultValue:o.COLOR.SILVER},{legend:o.LEGEND.TEXT_COLOR,defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="balloon-010">
    <p>これは会話風の吹き出しです。お好きなアイコン画像を指定できます。</p>
    <!-- お好きなアイコン画像を指定してください -->
    <img src="${o.IMG.ICON}" alt="" />
</div>`,css:`.balloon-010 {
    display: flex;
    justify-content: center;
    align-items: start;
    gap: 0 22px;
}

.balloon-010 img {
    max-width: 70px;
    height: 100%;
    border: 3px solid ${e[1]};
    border-radius: 50%;
}

.balloon-010 p {
    position: relative;
    max-width: 300px;
    margin: 3px 0 0;
    padding: .8em 1em;
    border-radius: 5px;
    background-color: ${e[0]};
    color: ${e[2]};
}

.balloon-010 p::before {
    position: absolute;
    right: -15px;
    width: 15px;
    height: 30px;
    background-color: ${e[0]};
    clip-path: polygon(0 0, 100% 50%, 0 100%);
    content: '';
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-12'] = (function(l){
    const p = {id:12,name:{ja:"LINE風",en:"LINE style"},inputs:{radios:[{legend:{ja:"右側のアイコン",en:"Icon on the right"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]}]},codeFunc({radios:o}){return{html:`<div class="balloon-012">
    <div class="balloon-012__section">
        <!-- お好きなアイコン画像を指定してください -->
        <img class="balloon-012__img" src="${l.IMG.ICON}" alt="" width="45" height="45" />
        <p class="balloon-012__p left">これはLINE風の吹き出しです。</p>
    </div>
    <div class="balloon-012__section">
        <p class="balloon-012__p right">使い所こそ限られますが、遊び心のある可愛らしいデザインになります。</p>${o[0]?`
        <!-- お好きなアイコン画像を指定してください -->
        <img class="balloon-012__img" src="${l.IMG.ICON}" alt="" width="45" height="45" />`:""}
    </div>
</div>`,css:`.balloon-012 {
    display: grid;
    gap: 1em 0;
    padding: 25px 15px;
    background-color: #769ece;
}

.balloon-012__section {
    display: flex;
    align-items: center;
    gap: 0 15px;
}

.balloon-012__img {
    width: 2.7em;
    height: 2.7em;
    border-radius: 50%;
}

.balloon-012__p {
    display: inline-block;
    position: relative;
    max-width: 80%;
    margin: 0;
    padding: .4em .8em;
    border-radius: 20px;
    color: #333;
    font-size: .9em;
}

.balloon-012__p.left {
    background-color: #fff;
}

.balloon-012__p.right {
    background-color: #30e852;${o[0]?`
    margin-left: auto;`:`
    margin: 0 10px 0 auto;`}
}

.balloon-012__p::before {
    position: absolute;
    top: -15px;
    width: 20px;
    height: 30px;
    content: '';
}

.balloon-012__p.left::before {
    left: -10px;
    border-radius: 0 0 0 15px;
    box-shadow: -3px -15px 0 -7px white inset;
}

.balloon-012__p.right::before {
    right: -10px;
    border-radius: 0 0 15px 0;
    box-shadow: 3px -15px 0 -7px #30e852 inset;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['balloon-13'] = (function(e){
    const p = {id:13,name:{ja:"画像 + 補足",en:"Image + caption"},comment:{ja:"画像の横に吹き出しを添えてみました。画像を元に手順を説明する際などにとても効果的なデザインです。ちなみにモバイルの場合は画像の下に吹き出しが表示されます。",en:"I added a speech bubble next to the image. This design is very effective when explaining procedures based on images. By the way, on mobile, a speech bubble will be displayed below the image."},inputs:{colors:[{legend:e.LEGEND.BORDER_COLOR,defaultValue:e.COLOR.SILVER_DARK}]},codeFunc({colors:o}){return{html:`<div class="balloon-013">
    <div class="balloon-013__img-wrap">
        <!-- お好きな画像を指定してください -->
        <img class="balloon-013__img" src="${e.IMG.CATCH}" alt="" width="320" height="180" />
    </div>
    <p class="balloon-013__text">ここに文章を入れます。ここに文章を入れます。ここに文章を入れます。</p>
</div>`,css:`.balloon-013__img-wrap {
    max-width: 100%;
}

.balloon-013__img {
    width: 100%;
    height: auto;
}

.balloon-013__text {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: .7em;
    border: 3px solid ${o[0]};
    border-radius: 10px;
    font-size: .95em;
}

.balloon-013__text::before,
.balloon-013__text::after {
    position: absolute;
    top: -15px;
    width: 30px;
    height: 15px;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
    content: '';
}

.balloon-013__text::before {
    background-color: ${o[0]};
}

.balloon-013__text::after {
    top: -11px;
    background-color: #fff;
}

@media only screen and (min-width: 521px) {
    .balloon-013 {
        display: flex;
        align-items: center;
        gap: 0 15px;
    }

    .balloon-013__img-wrap,
    .balloon-013__text {
        flex-basis: 50%;
    }

    .balloon-013__text::before,
    .balloon-013__text::after {
        top: unset;
        left: -15px;
        width: 15px;
        height: 30px;
        clip-path: polygon(0 50%, 100% 0, 100% 100%);
    }

    .balloon-013__text::after {
        top: unset;
        left: -11px;
    }
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['accordion-3'] = (function(r, e){
    const c = {id:3,name:{ja:"下線あり",en:"With underline"},inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:r.COLOR.SILVER_DARK},{legend:{ja:"タイトルの色",en:"Title color"},defaultValue:r.COLOR.BLACK_TEXT},{legend:{ja:"詳細の文字色",en:"Detail color"},defaultValue:r.COLOR.BLACK_TEXT}],radios:[e.RADIO.ICON_TYPE]},codeFunc({colors:o,radios:a}){return{html:`<details class="accordion-003">
    <summary>アコーディオンのデザイン</summary>
    <p>下線だけのシンプルなアコーディオンメニュー。クセがなくどんなサイトでも使いやすいのが特徴です。</p>
</details>
<details class="accordion-003">
    <summary>アコーディオンのデザイン</summary>
    <p>下線だけのシンプルなアコーディオンメニュー。クセがなくどんなサイトでも使いやすいのが特徴です。</p>
</details>`,css:`.accordion-003 {
    max-width: 500px;
    margin-bottom: 7px;
    border-bottom: 2px solid ${o[0]};
}

.accordion-003 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    color: ${o[1]};
    font-weight: 600;
    cursor: pointer;
}

.accordion-003 summary::-webkit-details-marker {
    display: none;
}${a[0]?`

.accordion-003 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${o[1]}b3;
    border-right: 3px solid ${o[1]}b3;
    content: '';
    transition: transform .3s;
}

.accordion-003[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-003 summary::before,
.accordion-003 summary::after {
    width: 3px;
    height: .9em;
    border-radius: 5px;
    background-color: ${o[1]}b3;
    content: '';
}

.accordion-003 summary::before {
    position: absolute;
    right: 2em;
    rotate: 90deg;
}

.accordion-003 summary::after {
    transition: rotate .3s;
}

.accordion-003[open] summary::after {
    rotate: 90deg;
}`}

.accordion-003 p {
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: .3em 2em 1.5em;
    color: ${o[2]};
    transition: transform .5s, opacity .5s;
}

.accordion-003[open] p {
    transform: none;
    opacity: 1;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_accordion.COMMON);
  root.designInserterPartCodeFuncs['accordion-4'] = (function(o, t){
    const c = {id:4,name:{ja:"枠線あり",en:"With border"},inputs:{colors:[{legend:o.LEGEND.BORDER_COLOR,defaultValue:o.COLOR.SILVER_DARK},{legend:{ja:"タイトルの色",en:"Title color"},defaultValue:o.COLOR.BLACK_TEXT},{legend:{ja:"詳細の文字色",en:"Detail color"},defaultValue:o.COLOR.BLACK_TEXT}],radios:[t.RADIO.SHAPE,t.RADIO.ICON_TYPE]},codeFunc({colors:r,radios:a}){return{html:`<details class="accordion-004">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>枠線付きのシンプルなアコーディオンメニューです。</p>
</details>
<details class="accordion-004">
    <summary>どのような特徴がありますか？</summary>
    <p>クセがなく、どんなサイトでも使いやすい汎用性があります。</p>
</details>`,css:`.accordion-004 {
    max-width: 500px;
    margin-bottom: 7px;
    border: 2px solid ${r[0]};
    border-radius: ${a[0]};
}

.accordion-004 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    color: ${r[1]};
    font-weight: 600;
    cursor: pointer;
}

.accordion-004 summary::-webkit-details-marker {
    display: none;
}${a[1]?`

.accordion-004 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${r[1]}b3;
    border-right: 3px solid ${r[1]}b3;
    content: '';
    transition: transform .3s;
}

.accordion-004[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-004 summary::before,
.accordion-004 summary::after {
    width: 3px;
    height: .9em;
    border-radius: 5px;
    background-color: ${r[1]}b3;
    content: '';
}

.accordion-004 summary::before {
    position: absolute;
    right: 2em;
    rotate: 90deg;
}

.accordion-004 summary::after {
    transition: rotate .3s;
}

.accordion-004[open] summary::after {
    rotate: 90deg;
}`}

.accordion-004 p {
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: .3em 2em 1.5em;
    color: ${r[2]};
    transition: transform .5s, opacity .5s;
}

.accordion-004[open] p {
    transform: none;
    opacity: 1;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_accordion.COMMON);
  root.designInserterPartCodeFuncs['accordion-6'] = (function(t, e, r){
    const u = {id:6,name:{ja:"背景色",en:"With background color"},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:t.COLOR.SILVER},{legend:{ja:"文字色",en:"Text color"},defaultValue:t.COLOR.BLACK_TEXT}],radios:[e.RADIO.SHAPE,e.RADIO.ICON_TYPE]},codeFunc({colors:o,radios:a}){return{html:`<details class="accordion-006">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>背景色付きのシンプルなアコーディオンメニューです。</p>
</details>
<details class="accordion-006">
    <summary>どのような特徴がありますか？</summary>
    <p>クセがなく、どんなサイトでも使いやすい汎用性があります。</p>
</details>`,css:`.accordion-006 {
    max-width: 500px;
    margin-bottom: 7px;
    background-color: ${o[0]};
    border-radius: ${a[0]};
}

.accordion-006 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    color: ${o[1]};
    font-weight: 600;
    cursor: pointer;
}

.accordion-006 summary::-webkit-details-marker {
    display: none;
}${a[1]?`

.accordion-006 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${r(o[0],-3)};
    border-right: 3px solid ${r(o[0],-3)};
    content: '';
    transition: transform .3s;
}

.accordion-006[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-006 summary::before,
.accordion-006 summary::after {
    width: 3px;
    height: .9em;
    border-radius: 5px;
    background-color: ${r(o[0],-3)};
    content: '';
}

.accordion-006 summary::before {
    position: absolute;
    right: 2em;
    rotate: 90deg;
}

.accordion-006 summary::after {
    transition: rotate .3s;
}

.accordion-006[open] summary::after {
    rotate: 90deg;
}`}

.accordion-006 p {
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: .3em 2em 1.5em;
    color: ${o[1]};
    transition: transform .5s, opacity .5s;
}

.accordion-006[open] p {
    transform: none;
    opacity: 1;
}`}}};
    return function(params){ return u.codeFunc(params); };
  })(_di_consts, _di_common_accordion.COMMON, _di_funcs.a);
  root.designInserterPartCodeFuncs['accordion-8'] = (function(a, t){
    const c = {id:8,name:{ja:"白背景 & シャドウ",en:"White background & shadow"},options:{bgColor:a.COLOR.SILVER},inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:a.COLOR.BLACK_TEXT}],radios:[t.RADIO.SHAPE,t.RADIO.ICON_TYPE]},codeFunc({colors:o,radios:r}){return{html:`<details class="accordion-008">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>白背景にシャドウを付けたアコーディオンメニューです。</p>
</details>
<details class="accordion-008">
    <summary>どのような特徴がありますか？</summary>
    <p>シャドウのおかげで目立ちやすく、グレー系を背景色としている個所で使用するのがおすすめです。</p>
</details>`,css:`.accordion-008 {
    max-width: 500px;
    margin-bottom: 10px;
    border-radius: ${r[0]};
    box-shadow: 0 7px 15px -5px rgb(0 0 0 / 5%);
    background-color: #fff;
}

.accordion-008 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    color: ${o[0]};
    font-weight: 600;
    cursor: pointer;
}

.accordion-008 summary::-webkit-details-marker {
    display: none;
}${r[1]?`

.accordion-008 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${o[0]}b3;
    border-right: 3px solid ${o[0]}b3;
    content: '';
    transition: transform .3s;
}

.accordion-008[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-008 summary::before,
.accordion-008 summary::after {
    width: 3px;
    height: .9em;
    border-radius: 5px;
    background-color: ${o[0]}b3;
    content: '';
}

.accordion-008 summary::before {
    position: absolute;
    right: 2em;
    rotate: 90deg;
}

.accordion-008 summary::after {
    transition: rotate .3s;
}

.accordion-008[open] summary::after {
    rotate: 90deg;
}`}

.accordion-008 p {
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: .3em 2em 1.5em;
    color: ${o[0]};
    transition: transform .5s, opacity .5s;
}

.accordion-008[open] p {
    transform: none;
    opacity: 1;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_accordion.COMMON);
  root.designInserterPartCodeFuncs['accordion-1'] = (function(r, t){
    const s = {id:1,name:{ja:"単色背景",en:"Monochromatic background"},inputs:{colors:[{legend:{ja:"ラベルの背景色",en:"Label background color"},defaultValue:r.COLOR.BLUE},{legend:{ja:"詳細の背景色",en:"Detail background color"},defaultValue:r.COLOR.SILVER},{legend:{ja:"詳細の文字色",en:"Detail text color"},defaultValue:r.COLOR.BLACK_TEXT}],radios:[t.RADIO.SHAPE,t.RADIO.ICON_TYPE]},codeFunc({colors:o,radios:a}){return{html:`<details class="accordion-001">
    <summary>アコーディオンのデザイン</summary>
    <p>矢印付きのアコーディオン。開閉させると矢印が回転します。サイトのテーマカラーを背景色に設定するのがおすすめです。</p>
</details>
<details class="accordion-001">
    <summary>アコーディオンのデザイン</summary>
    <p>矢印付きのアコーディオン。開閉させると矢印が回転します。サイトのテーマカラーを背景色に設定するのがおすすめです。</p>
</details>`,css:`.accordion-001 {
    max-width: 500px;
    background-color: ${o[1]};
}

.accordion-001:not([open]) {
    margin-bottom: 7px;
}

.accordion-001 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    border-radius: ${a[0]};
    background-color: ${o[0]};
    color: #fff;
    font-weight: 600;
    cursor: pointer;
}

.accordion-001 summary::-webkit-details-marker {
    display: none;
}${a[1]?`

.accordion-001 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid #fff;
    border-right: 3px solid #fff;
    content: '';
    transition: transform .3s;
}

.accordion-001[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-001 summary::before,
.accordion-001 summary::after {
    width: 3px;
    height: .9em;
    border-radius: 5px;
    background-color: #fff;
    content: '';
}

.accordion-001 summary::before {
    position: absolute;
    right: 2em;
    rotate: 90deg;
}

.accordion-001 summary::after {
    transition: rotate .3s;
}

.accordion-001[open] summary::after {
    rotate: 90deg;
}`}

.accordion-001 p {
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: 1em 2em 2em 2em;
    color: ${o[2]};
    transition: transform .5s, opacity .5s;
}

.accordion-001[open] p {
    transform: none;
    opacity: 1;
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_accordion.COMMON);
  root.designInserterPartCodeFuncs['accordion-2'] = (function(a, e, t){
    const l = {id:2,name:{ja:"枠線あり",en:"With border"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.BLUE},{legend:{ja:"詳細の文字色",en:"Detail color"},defaultValue:a.COLOR.BLACK_TEXT}],radios:[t.RADIO.SHAPE,t.RADIO.ICON_TYPE]},codeFunc({colors:r,radios:o}){return{html:`<details class="accordion-002">
    <summary>アコーディオンのデザイン</summary>
    <p>プラスマイナスの付きのアコーディオン。開閉させるとアイコンが回転します。枠線付きなので複数並べたい際におすすめです。</p>
</details>
<details class="accordion-002">
    <summary>アコーディオンのデザイン</summary>
    <p>プラスマイナスの付きのアコーディオン。開閉させるとアイコンが回転します。枠線付きなので複数並べたい際におすすめです。</p>
</details>`,css:`.accordion-002 {
    max-width: 500px;
    margin-bottom: 7px;
    border: 2px solid ${r[0]};
    border-radius: ${o[0]};
}

.accordion-002 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2028%2028%22%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2214%22%20cy%3D%2214%22%20r%3D%2214%22%20style%3D%22fill%3A%23${e(r[0])}%3B%22%2F%3E%0A%3C%2Fsvg%3E');
    background-position: right calc(2em - 7px) center;
    background-size: 22px;
    background-repeat: no-repeat;
    color: ${r[0]};
    font-weight: 600;
    cursor: pointer;
}

.accordion-002 summary::-webkit-details-marker {
    display: none;
}${o[1]?`

.accordion-002 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 5px;
    height: 5px;
    border-bottom: 3px solid #fff;
    border-right: 3px solid #fff;
    content: '';
    transition: transform .3s;
}

.accordion-002[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-002 summary::before,
.accordion-002 summary::after {
    position: absolute;
    right: calc(2em + 2.5px);
    width: 3px;
    height: 10px;
    border-radius: 5px;
    background-color: #fff;
    content: '';
}

.accordion-002 summary::before {
    rotate: 90deg;
}

.accordion-002 summary::after {
    transition: rotate .3s;
}

.accordion-002[open] summary::after {
    rotate: 90deg;
}`}

.accordion-002 p {
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: 0 2em 1.5em;
    color: ${r[1]};
    transition: transform .5s, opacity .5s;
}

.accordion-002[open] p {
    transform: none;
    opacity: 1;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts, _di_funcs.r, _di_common_accordion.COMMON);
  root.designInserterPartCodeFuncs['accordion-7'] = (function(a, t){
    const s = {id:7,name:{ja:"枠線あり & 吹き出し風",en:"With background & like speech bubble"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.BLUE},{legend:{ja:"詳細の文字色",en:"Detail color"},defaultValue:a.COLOR.BLACK_TEXT}],radios:[t.RADIO.SHAPE,t.RADIO.ICON_TYPE]},codeFunc({colors:o,radios:r}){return{html:`<details class="accordion-007">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>背景色付き&吹き出し風のアコーディオンメニューです。</p>
</details>
<details class="accordion-007">
    <summary>どのような特徴がありますか？</summary>
    <p>吹き出しのおかげで、より対話をしているような印象を与えます。</p>
</details>`,css:`.accordion-007 {
    max-width: 500px;
    margin-bottom: 7px;
}

.accordion-007 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    border: 2px solid ${o[0]};
    border-radius: ${r[0]};
    color: ${o[0]};
    font-weight: 600;
    cursor: pointer;
}

.accordion-007 summary::-webkit-details-marker {
    display: none;
}${r[1]?`

.accordion-007 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    border-bottom: 3px solid ${o[0]};
    border-right: 3px solid ${o[0]};
    content: '';
    transition: transform .3s;
}

.accordion-007[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-007 summary::before,
.accordion-007 summary::after {
    width: 3px;
    height: .9em;
    border-radius: 5px;
    background-color: ${o[0]};
    content: '';
}

.accordion-007 summary::before {
    position: absolute;
    right: 2em;
    rotate: 90deg;
}

.accordion-007 summary::after {
    transition: rotate .3s;
}

.accordion-007[open] summary::after {
    rotate: 90deg;
}`}

.accordion-007 p {
    position: relative;
    transform: translateY(-10px);
    opacity: 0;
    margin-top: 20px;
    padding: .8em 1.2em;
    border: 2px solid ${o[0]};
    border-radius: ${r[0]};
    background-color: #fff;
    color: ${o[1]};
    transition: transform .5s, opacity .5s;
}

.accordion-007[open] p {
    transform: none;
    opacity: 1;
}

.accordion-007 p::before,
.accordion-007 p::after {
    position: absolute;
    top: -15px;
    left: 1.2em;
    width: 30px;
    height: 15px;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
    content: '';
}

.accordion-007 p::before {
    background-color: ${o[0]};
}

.accordion-007 p::after {
    top: -12px;
    background-color: #fff;
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_accordion.COMMON);
  root.designInserterPartCodeFuncs['accordion-5'] = (function(r, t, a){
    const l = {id:5,name:{ja:"見出し風",en:"Like heading"},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:r.COLOR.SILVER},{legend:{ja:"左線色",en:"Left line color"},defaultValue:r.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:r.COLOR.BLACK_TEXT}],radios:[t.RADIO.ICON_TYPE]},codeFunc({colors:o,radios:e}){return{html:`<details class="accordion-005">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>見出し風のアコーディオンメニューです。</p>
</details>
<details class="accordion-005">
    <summary>どのような特徴がありますか？</summary>
    <p>目を引く可愛らしさとスタイリッシュさを兼ね備えています。</p>
</details>`,css:`.accordion-005 {
    max-width: 500px;
}

.accordion-005:not([open]) {
    margin-bottom: 7px;
}

.accordion-005 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em;
    border-left: 5px solid ${o[1]};
    background-color: ${o[0]};
    color: ${o[2]};
    font-weight: 600;
    cursor: pointer;
}

.accordion-005 summary::-webkit-details-marker {
    display: none;
}${e[0]?`

.accordion-005 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${a(o[0],-3)};
    border-right: 3px solid ${a(o[0],-3)};
    content: '';
    transition: transform .3s;
}

.accordion-005[open] summary::after {
    transform: rotate(225deg);
}`:`

.accordion-005 summary::before,
.accordion-005 summary::after {
    width: 3px;
    height: .9em;
    border-radius: 5px;
    background-color: ${a(o[0],-3)};
    content: '';
}

.accordion-005 summary::before {
    position: absolute;
    right: 2em;
    rotate: 90deg;
}

.accordion-005 summary::after {
    transition: rotate .3s;
}

.accordion-005[open] summary::after {
    rotate: 90deg;
}`}

.accordion-005 p {
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: 1em 2em 2em 2em;
    color: ${o[2]};
    transition: transform .5s, opacity .5s;
}

.accordion-005[open] p {
    transform: none;
    opacity: 1;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts, _di_common_accordion.COMMON, _di_funcs.a);
  root.designInserterPartCodeFuncs['search-form-3'] = (function(r, o, a){
    const c = {id:3,name:{ja:"枠線あり",en:"With border"},imgFormat:"svg",inputs:{colors:[{legend:r.LEGEND.BORDER_COLOR,defaultValue:r.COLOR.BLACK_TEXT_LIGHT},{legend:{ja:"プレースホルダーの色",en:"Placeholder color"},defaultValue:r.COLOR.BLACK_TEXT_LIGHT}],radios:[o.RADIO.SHAPE]},codeFunc({colors:e,radios:t}){return{html:`<form action="#" class="search-form-3">
    <label>
        <input type="text" placeholder="キーワードを入力">
    </label>
    <button type="submit" aria-label="検索"></button>
</form>`,css:`.search-form-3 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    border: 1px solid ${e[0]};
    border-radius: ${t[0]};
}

.search-form-3 input {
    width: 250px;
    height: 45px;
    padding: 5px 15px;
    border: none;
    box-sizing: border-box;
    font-size: 1em;
    outline: none;
}

.search-form-3 input::placeholder{
    color: ${e[1]};
}

.search-form-3 button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 45px;
    border: none;
    background-color: transparent;
    cursor: pointer;
}

.search-form-3 button::after {
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z' fill='%23${a(e[0])}'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_search_form.COMMON, _di_funcs.r);
  root.designInserterPartCodeFuncs['search-form-4'] = (function(r, t, a){
    const c = {id:4,name:{ja:"枠線あり & 左アイコン",en:"With border & left icon"},imgFormat:"svg",inputs:{colors:[{legend:r.LEGEND.BORDER_COLOR,defaultValue:r.COLOR.BLACK_TEXT_LIGHT},{legend:{ja:"プレースホルダーの色",en:"Placeholder color"},defaultValue:r.COLOR.BLACK_TEXT_LIGHT}],radios:[t.RADIO.SHAPE]},codeFunc({colors:e,radios:o}){return{html:`<form action="#" class="search-form-4">
    <button type="submit" aria-label="検索"></button>
    <label>
        <input type="text" placeholder="キーワードを入力">
    </label>
</form>`,css:`.search-form-4 {
    display: flex;
    align-items: center;
    overflow: hidden;
    border: 1px solid ${e[0]};
    border-radius: ${o[0]};
}

.search-form-4 input {
    width: 250px;
    height: 45px;
    padding: 5px 15px 5px 0;
    border: none;
    box-sizing: border-box;
    font-size: 1em;
    outline: none;
}

.search-form-4 input::placeholder {
    color: ${e[1]};
}

.search-form-4 button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 45px;
    border: none;
    background-color: transparent;
    cursor: pointer;
}

.search-form-4 button::before {
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z' fill='%23${a(e[0])}'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_search_form.COMMON, _di_funcs.r);
  root.designInserterPartCodeFuncs['search-form-5'] = (function(r, o, a){
    const m = {id:5,name:{ja:"背景色あり",en:"With background color"},imgFormat:"svg",inputs:{colors:[{legend:r.LEGEND.BG_COLOR,defaultValue:r.COLOR.SILVER},{legend:{ja:"プレースホルダーの色",en:"Placeholder color"},defaultValue:r.COLOR.BLACK_TEXT_LIGHT}],radios:[o.RADIO.SHAPE]},codeFunc({colors:e,radios:t}){return{html:`<form action="#" class="search-form-5">
    <label>
        <input type="text" placeholder="キーワードを入力">
    </label>
    <button type="submit" aria-label="検索"></button>
</form>`,css:`.search-form-5 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 250px; /* 任意の幅に調整してください */
    overflow: hidden;
    border-radius: ${t[0]};
    background-color: ${e[0]};
}

.search-form-5 input {
    height: 45px;
    padding: 5px 15px;
    border: none;
    box-sizing: border-box;
    background-color: ${e[0]};
    font-size: 1em;
    outline: none;
}

.search-form-5 input::placeholder {
    color: ${e[1]};
}

.search-form-5 button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 45px;
    border: none;
    background-color: transparent;
    cursor: pointer;
}

.search-form-5 button::after {
    width: 20px;
    height: 20px;
    background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%20%3Cpath%20d%3D%22M23.7%2020.8%2019%2016.1c-.2-.2-.5-.3-.8-.3h-.8c1.3-1.7%202-3.7%202-6C19.5%204.4%2015.1%200%209.7%200S0%204.4%200%209.7s4.4%209.7%209.7%209.7c2.3%200%204.3-.8%206-2v.8c0%20.3.1.6.3.8l4.7%204.7c.4.4%201.2.4%201.6%200l1.3-1.3c.5-.5.5-1.2.1-1.6zm-14-5.1c-3.3%200-6-2.7-6-6s2.7-6%206-6%206%202.7%206%206-2.6%206-6%206z%22%20fill%3D%22%23${a(e[1])}%22%3E%3C%2Fpath%3E%20%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    content: '';
}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_common_search_form.COMMON, _di_funcs.r);
  root.designInserterPartCodeFuncs['search-form-2'] = (function(r, t){
    const c = {id:2,name:{ja:"スタンダード",en:"Standard"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"ボタンの色",en:"Button color"},defaultValue:r.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:r.COLOR.SILVER},{legend:{ja:"プレースホルダーの色",en:"Placeholder color"},defaultValue:r.COLOR.BLACK_TEXT_LIGHT}],radios:[t.RADIO.SHAPE]},codeFunc({colors:e,radios:o}){return{html:`<form action="#" class="search-form-2">
    <label>
        <input type="text" placeholder="キーワードを入力">
    </label>
    <button type="submit" aria-label="検索"></button>
</form>`,css:`.search-form-2 {
    display: flex;
    align-items: center;
    overflow: hidden;
    border-radius: ${o[0]};
}

.search-form-2 input {
    width: 250px;
    height: 45px;
    padding: 5px 15px;
    border: none;
    border-radius: 3px 0 0 3px;
    box-sizing: border-box;
    background-color: ${e[1]};
    font-size: 1em;
    outline: none;
}

.search-form-2 input::placeholder {
    color: ${e[2]};
}

.search-form-2 button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 45px;
    border: none;
    border-radius: 0 3px 3px 0;
    background-color: ${e[0]};
    cursor: pointer;
}

.search-form-2 button::after {
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_search_form.COMMON);
  root.designInserterPartCodeFuncs['search-form-1'] = (function(r, o){
    const d = {id:1,name:{ja:"枠線あり",en:"With border"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:r.COLOR.BLUE},{legend:{ja:"プレースホルダーの色",en:"Placeholder color"},defaultValue:r.COLOR.BLACK_TEXT_LIGHT}],radios:[o.RADIO.SHAPE]},codeFunc({colors:e,radios:t}){return{html:`<form action="#" class="search-form-1">
    <label>
        <input type="text" placeholder="キーワードを入力">
    </label>
    <button type="submit" aria-label="検索"></button>
</form>`,css:`.search-form-1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    border: 2px solid ${e[0]};
    border-radius: ${t[0]};
}

.search-form-1 input {
    width: 250px;
    height: 45px;
    padding: 5px 15px;
    border: none;
    box-sizing: border-box;
    font-size: 1em;
    outline: none;
}

.search-form-1 input::placeholder{
    color: ${e[1]};
}

.search-form-1 button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 45px;
    border: none;
    background-color: ${e[0]};
    cursor: pointer;
}

.search-form-1 button::after {
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_common_search_form.COMMON);
  root.designInserterPartCodeFuncs['search-form-6'] = (function(r, o){
    const s = {id:6,name:{ja:"Google風",en:"Google style"},imgFormat:"svg",inputs:{colors:[{legend:r.LEGEND.BORDER_COLOR,defaultValue:"#dfe1e5"},{legend:{ja:"アイコンの色",en:"Placeholder color"},defaultValue:"#9aa0a6"}]},codeFunc({colors:e}){return{html:`<form action="#" class="search-form-6">
    <label>
        <input type="text" aria-label="キーワードを入力">
    </label>
</form>`,css:`.search-form-6 {
    display: flex;
    align-items: center;
    overflow: hidden;
    border: 1px solid ${e[0]};
    border-radius: 24px;
}

.search-form-6:hover {
    box-shadow: 0 1px 6px rgb(32 33 36 / 28%);
}

.search-form-6::before {
    width: 45px;
    height: 15px;
    background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%20%3Cpath%20d%3D%22M23.7%2020.8%2019%2016.1c-.2-.2-.5-.3-.8-.3h-.8c1.3-1.7%202-3.7%202-6C19.5%204.4%2015.1%200%209.7%200S0%204.4%200%209.7s4.4%209.7%209.7%209.7c2.3%200%204.3-.8%206-2v.8c0%20.3.1.6.3.8l4.7%204.7c.4.4%201.2.4%201.6%200l1.3-1.3c.5-.5.5-1.2.1-1.6zm-14-5.1c-3.3%200-6-2.7-6-6s2.7-6%206-6%206%202.7%206%206-2.6%206-6%206z%22%20fill%3D%22%23${o(e[1])}%22%3E%3C%2Fpath%3E%20%3C%2Fsvg%3E');
    background-position: center;
    background-repeat: no-repeat;
    content: '';
}

.search-form-6 input {
    width: 250px;
    height: 40px;
    padding: 5px 25px 5px 0;
    border: none;
    box-sizing: border-box;
    outline: none;
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['search-form-7'] = (function(t){
    const l = {id:7,name:{ja:"Yahoo風",en:"Yahoo style"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"ボタン色",en:"Button color"},defaultValue:"#4070ff"},{legend:t.LEGEND.BORDER_COLOR,defaultValue:"#999999"}]},codeFunc({colors:e}){return{html:`<form action="#" class="search-form-7">
    <label>
        <input type="text" aria-label="キーワードを入力">
    </label>
    <button type="submit">検索</button>
</form>`,css:`.search-form-7 {
    display: flex;
    align-items: center;
    gap: 0 10px;
}

.search-form-7 label {
    width: 250px;
}

.search-form-7 input {
    width: 100%;
    height: 34px;
    padding: 1px 5px 1px 8px;
    border: 1px solid ${e[1]};
    box-sizing: border-box;
    color: #000;
    outline: none;
}

.search-form-7 button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30%;
    max-width: 140px;
    height: 34px;
    border: none;
    background-color: ${e[0]};
    color: #fff;
    cursor: pointer;
}

.search-form-7 button::before {
    width: 14px;
    height: 14px;
    margin-right: 5px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['selectbox-3'] = (function(e, n){
    const c = {id:3,name:{ja:"スタンダード",en:"Standard"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"枠線の色",en:"Border color"},defaultValue:e.COLOR.SILVER_DARK},{legend:{ja:"文字色",en:"Text color"},defaultValue:e.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:e.BORDER_RADIUS.ELLIPSE}]}]},codeFunc({colors:o,radios:t}){return{html:`<label class="selectbox-3">
    <select>
        <option>optionの例1</option>
        <option>optionの例2</option>
        <option>optionの例3</option>
    </select>
</label>`,css:`.selectbox-3 {
    display: inline-flex;
    align-items: center;
    position: relative;
}

.selectbox-3::after {
    position: absolute;
    right: 15px;
    width: 10px;
    height: 7px;
    background-color: ${n(o[1],2)};
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
    pointer-events: none;
}

.selectbox-3 select {
    appearance: none;
    min-width: 230px;
    height: 2.8em;
    padding: .4em calc(.8em + 30px) .4em .8em;
    border: 1px solid ${o[0]};
    border-radius: ${t[0]};
    background-color: #fff;
    color: ${o[1]};
    font-size: 1em;
    cursor: pointer;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['selectbox-6'] = (function(e, l){
    const s = {id:6,name:{ja:"矢印2つ",en:"Two arrows"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"枠線の色",en:"Border color"},defaultValue:e.COLOR.SILVER_DARK},{legend:{ja:"文字色",en:"Text color"},defaultValue:e.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:e.BORDER_RADIUS.ELLIPSE}]}]},codeFunc({colors:o,radios:t}){return{html:`<label class="selectbox-6">
    <select>
        <option>optionの例1</option>
        <option>optionの例2</option>
        <option>optionの例3</option>
    </select>
</label>`,css:`.selectbox-6 {
    position: relative;
}

.selectbox-6::before,
.selectbox-6::after {
    position: absolute;
    right: 15px;
    width: 9px;
    height: 6px;
    background-color: ${l(o[1],2)};
    content: '';
    pointer-events: none;
}

.selectbox-6::before {
    top: calc(50% - 9px);
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.selectbox-6::after {
    bottom: calc(50% - 9px);
    clip-path: polygon(0 0, 50% 100%, 100% 0);
}

.selectbox-6 select {
    appearance: none;
    min-width: 230px;
    height: 2.8em;
    padding: .4em calc(.8em + 30px) .4em .8em;
    border: 1px solid ${o[0]};
    border-radius: ${t[0]};
    background-color: #fff;
    color: ${o[1]};
    font-size: 1em;
    cursor: pointer;
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['selectbox-5'] = (function(o, t){
    const c = {id:5,name:{ja:"下線あり",en:"With underline"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:o.COLOR.SILVER_DARK},{legend:{ja:"文字色",en:"Text color"},defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<label class="selectbox-5">
    <select>
        <option>optionの例1</option>
        <option>optionの例2</option>
        <option>optionの例3</option>
    </select>
</label>`,css:`.selectbox-5 {
    display: inline-flex;
    align-items: center;
    position: relative;
}

.selectbox-5::after {
    position: absolute;
    right: 15px;
    width: 10px;
    height: 7px;
    background-color: ${t(e[1],2)};
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
    pointer-events: none;
}

.selectbox-5 select {
    appearance: none;
    min-width: 230px;
    height: 2.8em;
    padding: .4em calc(.8em + 30px) .4em .8em;
    border: none;
    border-bottom: 2px solid ${e[0]};
    background-color: #fff;
    color: ${e[1]};
    font-size: 1em;
    cursor: pointer;
}

.selectbox-5 select:focus {
    outline: none;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['selectbox-4'] = (function(e, n){
    const c = {id:4,name:{ja:"白背景 & シャドウ",en:"White background & shadow"},options:{bgColor:e.COLOR.SILVER},inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:e.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:e.BORDER_RADIUS.ELLIPSE}]}]},codeFunc({colors:o,radios:t}){return{html:`<label class="selectbox-4">
    <select>
        <option>optionの例1</option>
        <option>optionの例2</option>
        <option>optionの例3</option>
    </select>
</label>`,css:`.selectbox-4 {
    display: inline-flex;
    align-items: center;
    position: relative;
}

.selectbox-4::after {
    position: absolute;
    right: 15px;
    width: 10px;
    height: 7px;
    background-color: ${n(o[0],2)};
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
    pointer-events: none;
}

.selectbox-4 select {
    appearance: none;
    min-width: 230px;
    height: 2.8em;
    padding: .4em calc(.8em + 30px) .4em .8em;
    border: none;
    border-radius: ${t[0]};
    box-shadow: 0 4px 4px rgb(0 0 0 / 2%), 0 2px 3px -2px rgba(0 0 0 / 5%);
    background-color: #fff;
    color: ${o[0]};
    font-size: 1em;
    cursor: pointer;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['selectbox-1'] = (function(e){
    const s = {id:1,name:{ja:"フラットデザイン",en:"Flat design"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"矢印の背景色",en:"Arrow background color"},defaultValue:e.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:e.COLOR.SILVER}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:e.BORDER_RADIUS.ELLIPSE}]}]},codeFunc({colors:o,radios:t}){return{html:`<label class="selectbox-1">
    <select>
        <option>optionの例1</option>
        <option>optionの例2</option>
        <option>optionの例3</option>
    </select>
</label>`,css:`.selectbox-1 {
    position: relative;
}

.selectbox-1::before,
.selectbox-1::after {
    position: absolute;
    content: '';
    pointer-events: none;
}

.selectbox-1::before {
    display: inline-block;
    right: 0;
    width: 2.8em;
    height: 2.8em;
    border-radius: 0 ${t[0]} ${t[0]} 0;
    background-color: ${o[0]};
}

.selectbox-1::after {
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translate(50%, -50%) rotate(45deg);
    width: 6px;
    height: 6px;
    border-bottom: 3px solid #fff;
    border-right: 3px solid #fff;
}

.selectbox-1 select {
    appearance: none;
    min-width: 230px;
    height: 2.8em;
    padding: .4em 3.6em .4em .8em;
    border: none;
    border-radius: ${t[0]};
    background-color: ${o[1]};
    color: #333;
    font-size: 1em;
    cursor: pointer;
}

.selectbox-1 select:focus {
    outline: 2px solid ${o[0]};
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['selectbox-2'] = (function(o){
    const s = {id:2,name:{ja:"枠線あり",en:"With border"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:o.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:o.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:o.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:o.BORDER_RADIUS.ELLIPSE}]}]},codeFunc({colors:e,radios:t}){return{html:`<label class="selectbox-2">
    <select>
        <option>optionの例1</option>
        <option>optionの例2</option>
        <option>optionの例3</option>
    </select>
</label>`,css:`.selectbox-2 {
    position: relative;
}

.selectbox-2::before,
.selectbox-2::after {
    position: absolute;
    content: '';
    pointer-events: none;
}

.selectbox-2::before {
    right: 0;
    display: inline-block;
    width: 2.8em;
    height: 2.8em;
    border-radius: 0 ${t[0]} ${t[0]} 0;
    background-color: ${e[0]};
    content: '';
}

.selectbox-2::after {
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translate(50%, -50%) rotate(45deg);
    width: 6px;
    height: 6px;
    border-bottom: 3px solid #fff;
    border-right: 3px solid #fff;
    content: '';
}

.selectbox-2 select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    min-width: 230px;
    height: 2.8em;
    padding: .4em 3.6em .4em .8em;
    border: 2px solid ${e[0]};
    border-radius: ${t[0]};
    color: ${e[1]};
    font-size: 1em;
    cursor: pointer;
}

.selectbox-2 select:focus {
    outline: 1px solid ${e[0]};
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['breadcrumb-1'] = (function(a, o){
    const s = {id:1,name:{ja:"矢印",en:"Arrow"},comment:{ja:"シンプルなパンくずリスト。「ホーム」アイコンの有無は任意で選択することが可能です。リンクと分かりやすくするために、ホバーアニメーションを加えるのも良いですね。",en:'A simple breadcrumb trail. You can optionally choose whether or not to include the "Home" icon. It is also a good idea to add a hover animation to make the link easier to understand.'},imgFormat:"svg",inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:a.COLOR.BLACK_TEXT},{legend:{ja:"アイコン色",en:"Icon color"},defaultValue:a.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"ホームアイコン",en:"Home icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:r}){return{html:`<ol class="breadcrumb-001">
    <li><a href="#">ホーム</a></li>
    <li><a href="#">カテゴリー</a></li>
    <li><a href="#">タイトル</a></li>
</ol>`,css:`.breadcrumb-001 {
    display: flex;
    gap: 0 22px;
    list-style: none;
    padding: 0;
    font-size: .9em;
}

.breadcrumb-001 li {
    display: flex;
    align-items: center;
}${r[0]?`

.breadcrumb-001 li:first-child::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 4px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM11 13V19H13V13H11Z' fill='%23${o(e[1])}'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`:""}

.breadcrumb-001 li:not(:last-child)::after {
    display: inline-block;
    transform: rotate(45deg);
    width: .3em;
    height: .3em;
    margin-left: 10px;
    border-top: 1px solid ${e[1]};
    border-right: 1px solid ${e[1]};
    content: '';
}

.breadcrumb-001 a {
    color: ${e[0]};
    text-decoration: none;
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['breadcrumb-5'] = (function(a, r){
    const d = {id:5,name:{ja:"矢印（塗りつぶし）",en:"Arrow（fill）"},comment:{ja:"矢印を塗りつぶしてみました。よりコンパクトに見せたい場合におすすめです。",en:"I tried filling in the arrow. Recommended if you want to look more compact."},imgFormat:"svg",inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:a.COLOR.BLACK_TEXT},{legend:{ja:"アイコン色",en:"Icon color"},defaultValue:a.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"ホームアイコン",en:"Home icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:l}){return{html:`<ol class="breadcrumb-005">
    <li><a href="#">ホーム</a></li>
    <li><a href="#">カテゴリー</a></li>
    <li><a href="#">タイトル</a></li>
</ol>`,css:`.breadcrumb-005 {
    display: flex;
    gap: 0 20px;
    list-style: none;
    padding: 0;
    font-size: .9em;
}

.breadcrumb-005 li {
    display: flex;
    align-items: center;
}${l[0]?`

.breadcrumb-005 li:first-child::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 4px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM11 13V19H13V13H11Z' fill='%23${r(e[1])}'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`:""}

.breadcrumb-005 li:not(:last-child)::after {
    display: inline-block;
    width: .3em;
    height: .6em;
    margin-left: 12px;
    background-color: ${e[1]};
    clip-path: polygon(0 0, 100% 50%, 0 100%);
    content: '';
}

.breadcrumb-005 a {
    color: ${e[0]};
    text-decoration: none;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['breadcrumb-2'] = (function(a, l){
    const c = {id:2,name:{ja:"スラッシュ",en:"Slash"},imgFormat:"svg",comment:{ja:"区切りをスラッシュにしてみました。「/」という文字をそのまま指定しているので、矢印と比べて若干実装がシンプルになっています。",en:'I tried using a slash as the delimiter. Since the character "/" is specified as is, the implementation is slightly simpler than the arrow.'},inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:a.COLOR.BLACK_TEXT},{legend:{ja:"アイコン色",en:"Icon color"},defaultValue:a.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"ホームアイコン",en:"Home icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:i}){return{html:`<ol class="breadcrumb-002">
    <li><a href="#">ホーム</a></li>
    <li><a href="#">カテゴリー</a></li>
    <li><a href="#">タイトル</a></li>
</ol>`,css:`.breadcrumb-002 {
    display: flex;
    gap: 0 15px;
    list-style: none;
    padding: 0;
    font-size: .9em;
}

.breadcrumb-002 li {
    display: flex;
    align-items: center;
}${i[0]?`

.breadcrumb-002 li:first-child::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 4px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM11 13V19H13V13H11Z' fill='%23${l(e[1])}'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}`:""}

.breadcrumb-002 li:not(:last-child)::after {
    display: inline-block;
    margin-left: 15px;
    color: ${e[1]};
    content: '/';
}

.breadcrumb-002 a {
    color: ${e[0]};
    text-decoration: none;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_funcs.r);
  root.designInserterPartCodeFuncs['breadcrumb-3'] = (function(t, r){
    const c = {id:3,name:{ja:"灰色背景",en:"Gray background"},comment:{ja:"ダッシュボードのような矢印付きのパンくずリスト。白・黒をテーマカラーとしたサイトにおすすめです。",en:"Breadcrumbs with arrows like a dashboard. Recommended for sites with white and black theme colors."},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:r.COLOR.SILVER},{legend:{ja:"文字色",en:"Text color"},defaultValue:r.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"ホームアイコン",en:"Home icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:a}){return{html:`<ol class="breadcrumb-003">
    <li><a href="#">ホーム</a></li>
    <li><a href="#">カテゴリー</a></li>
    <li><a href="#">タイトル</a></li>
</ol>`,css:`.breadcrumb-003 {
    display: flex;
    gap: 0 20px;
    list-style: none;
    padding: 6px 0 6px 18px;
    border-radius: 3px;
    overflow: hidden;
    background-color: ${e[0]};
    font-size: .9em;
}

.breadcrumb-003 li {
    display: flex;
    align-items: center;
    position: relative;
    padding-right: 20px;
}${a[0]?`

.breadcrumb-003 li:first-child a::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 4px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM11 13V19H13V13H11Z' fill='%23${t(e[1])}'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    vertical-align: text-bottom;
    content: '';
}`:""}

.breadcrumb-003 li:not(:last-child)::before,
.breadcrumb-003 li:not(:last-child)::after{
    position: absolute;
    width: 0;
    height: 0;
    border-top: 20px solid transparent;
    border-bottom: 20px solid transparent;
    content:'';
}

.breadcrumb-003 li:not(:last-child)::before{
    right: 0;
    border-left: 10px solid #c6cdd3;
}

.breadcrumb-003 li:not(:last-child)::after{
    right: 1px;
    border-left: 10px solid ${e[0]};
}

.breadcrumb-003 a {
    color: ${e[1]};
    text-decoration: none;
}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_funcs.r, _di_consts);
  root.designInserterPartCodeFuncs['breadcrumb-4'] = (function(t){
    const d = {id:4,name:{ja:"カラフルな背景",en:"Colorful background"},comment:{ja:"背景を単色にすることでより矢印が目立つようにしたパンくずリスト。文字色が白のため、背景はコントラスト強めの色にするのがおすすめです。",en:"A breadcrumb list with a single color background to make the arrows more noticeable. Since the font color is white, it is recommended that the background be a color with strong contrast.。"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:t.COLOR.BLUE}],radios:[{legend:{ja:"ホームアイコン",en:"Home icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:r}){return{html:`<ol class="breadcrumb-004">
    <li><a href="#">ホーム</a></li>
    <li><a href="#">カテゴリー</a></li>
    <li><a href="#">タイトル</a></li>
</ol>`,css:`.breadcrumb-004 {
    display: flex;
    gap: 0 20px;
    list-style: none;
    padding: 6px 0 6px 18px;
    border-radius: 3px;
    overflow: hidden;
    background-color: ${e[0]};
    font-size: .9em;
}

.breadcrumb-004 li {
    display: flex;
    align-items: center;
    position: relative;
    padding-right: 20px;
}${r[0]?`

.breadcrumb-004 li:first-child a::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 4px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM11 13V19H13V13H11Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    vertical-align: text-bottom;
    content: '';
}`:""}

.breadcrumb-004 li:not(:last-child)::before,
.breadcrumb-004 li:not(:last-child)::after{
    position: absolute;
    width: 0;
    height: 0;
    border-top: 20px solid transparent;
    border-bottom: 20px solid transparent;
    content:'';
}

.breadcrumb-004 li:not(:last-child)::before{
    right: 0;
    border-left: 10px solid #fff;
}

.breadcrumb-004 li:not(:last-child)::after{
    right: 2px;
    border-left: 10px solid ${e[0]};
}

.breadcrumb-004 a {
    color: #fff;
    text-decoration: none;
}`}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['textbox-1'] = (function(l){
    const p = {id:1,name:{ja:"枠線あり",en:"With border"},imgFormat:"svg",inputs:{radios:[{legend:{ja:"タグの種類",en:"Tag type"},choices:[{label:{ja:"input",en:"input"},value:!0},{label:{ja:"textarea",en:"textarea"},value:!1}]},{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:l.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:l.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"ラベル",en:"Label"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({radios:e}){return{html:o(e[0],e[2]),css:r(e[1],e[2])}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['textbox-3'] = (function(o){
    const d = {id:3,name:{ja:"背景色あり",en:"With background color"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:"#f7f7f7"}],radios:[{legend:{ja:"タグの種類",en:"Tag type"},choices:[{label:{ja:"input",en:"input"},value:!0},{label:{ja:"textarea",en:"textarea"},value:!1}]},{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:o.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:o.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"ラベル",en:"Label"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:t,radios:e}){return{html:l(e[0],e[2]),css:n(e[1],e[2],t[0])}}};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['textbox-2'] = (function(o){
    const c = {id:2,name:{ja:"枠線 & 背景色あり",en:"With border & background color"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:"#f7f7f7"}],radios:[{legend:{ja:"タグの種類",en:"Tag type"},choices:[{label:{ja:"input",en:"input"},value:!0},{label:{ja:"textarea",en:"textarea"},value:!1}]},{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:o.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:o.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"ラベル",en:"Label"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:t,radios:e}){return{html:l(e[0],e[2]),css:r(e[1],e[2],t[0])}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['textbox-4'] = (function(o){
    const p = {id:4,name:{ja:"枠線あり",en:"With border"},imgFormat:"svg",options:{bgColor:o.COLOR.BLACK_DARKMODE},inputs:{radios:[{legend:{ja:"タグの種類",en:"Tag type"},choices:[{label:{ja:"input",en:"input"},value:!0},{label:{ja:"textarea",en:"textarea"},value:!1}]},{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:o.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:o.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"ラベル",en:"Label"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({radios:e}){return{html:a(e[0],e[2]),css:r(e[1],e[2])}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['textbox-5'] = (function(o){
    const s = {id:5,name:{ja:"背景色あり",en:"With background color"},imgFormat:"svg",options:{bgColor:o.COLOR.BLACK_DARKMODE},inputs:{radios:[{legend:{ja:"タグの種類",en:"Tag type"},choices:[{label:{ja:"input",en:"input"},value:!0},{label:{ja:"textarea",en:"textarea"},value:!1}]},{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:o.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:o.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"ラベル",en:"Label"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({radios:e}){return{html:a(e[0],e[2]),css:n(e[1],e[2])}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['tooltip-1'] = (function(t){
    const l = {id:1,name:{ja:"上向き",en:"Upward"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:t.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:t.COLOR.WHITE}]},codeFunc({colors:o}){return{html:`<div class="tooltip-001">
    <div>マウスホバーしてください</div>
    <span>ツールチップの内容</span>
</div>`,css:`.tooltip-001 {
    display: inline-block;
    position: relative;
}

.tooltip-001 > div {
    cursor: pointer;
}

.tooltip-001 > span {
    display: flex;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    padding: .5em 1em;
    border-radius: 3px;
    background-color: ${o[0]};
    color: ${o[1]};
    font-size: .7em;
    white-space: nowrap;
    transition: opacity .3s;
}

.tooltip-001 > span::before {
    position: absolute;
    top: -6px;
    width: 9px;
    height: 6px;
    background-color: inherit;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
    content: '';
}

.tooltip-001:hover > span {
    visibility: visible;
    opacity: 1;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['tooltip-2'] = (function(t){
    const l = {id:2,name:{ja:"下向き",en:"Downward"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:t.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:t.COLOR.WHITE}]},codeFunc({colors:o}){return{html:`<div class="tooltip-002">
    <div>マウスホバーしてください</div>
    <span>ツールチップの内容</span>
</div>`,css:`.tooltip-002 {
    display: inline-block;
    position: relative;
}

.tooltip-002 > div {
    cursor: pointer;
}

.tooltip-002 > span {
    display: flex;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    padding: .5em 1em;
    border-radius: 3px;
    background-color: ${o[0]};
    color: ${o[1]};
    font-size: .7em;
    white-space: nowrap;
    transition: opacity .3s;
}

.tooltip-002 > span::before {
    position: absolute;
    bottom: -6px;
    width: 9px;
    height: 6px;
    background-color: inherit;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.tooltip-002:hover > span {
    visibility: visible;
    opacity: 1;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['tooltip-3'] = (function(o){
    const n = {id:3,name:{ja:"左向き",en:"Facing left"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:o.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:o.COLOR.WHITE}]},codeFunc({colors:i}){return{html:`<div class="tooltip-003">
    <div>マウスホバーしてください</div>
    <span>ツールチップの内容</span>
</div>`,css:`.tooltip-003 {
    display: inline-block;
    position: relative;
}

.tooltip-003 > div {
    cursor: pointer;
}

.tooltip-003 > span {
    display: flex;
    align-items: center;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    top: 50%;
    right: -150px;
    transform: translateY(-50%);
    padding: .5em 1em;
    border-radius: 3px;
    background-color: ${i[0]};
    color: #fff;
    font-size: .7em;
    white-space: nowrap;
    transition: opacity .3s;
}

.tooltip-003 > span::before {
    position: absolute;
    left: -6px;
    width: 6px;
    height: 9px;
    background-color: inherit;
    clip-path: polygon(0 50%, 100% 0, 100% 100%);
    content: '';
}

.tooltip-003:hover > span {
    visibility: visible;
    opacity: 1;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['tooltip-4'] = (function(o){
    const l = {id:4,name:{ja:"右向き",en:"Facing right"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:o.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:o.COLOR.WHITE}]},codeFunc({colors:i}){return{html:`<div class="tooltip-004">
    <div>マウスホバーしてください</div>
    <span>ツールチップの内容</span>
</div>`,css:`.tooltip-004 {
    display: inline-block;
    position: relative;
}

.tooltip-004 > div {
    cursor: pointer;
}

.tooltip-004 > span {
    display: flex;
    align-items: center;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    top: 50%;
    left: -140px;
    transform: translateY(-50%);
    padding: .5em 1em;
    border-radius: 3px;
    background-color: ${i[0]};
    color: #fff;
    font-size: .7em;
    white-space: nowrap;
    transition: opacity .3s;
}

.tooltip-004 > span::before {
    position: absolute;
    right: -6px;
    width: 6px;
    height: 9px;
    background-color: inherit;
    clip-path: polygon(0 0, 100% 50%, 0 100%);
    content: '';
}

.tooltip-004:hover > span {
    visibility: visible;
    opacity: 1;
}`}}};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['tooltip-5'] = (function(i){
    const s = {id:5,name:{ja:"クエスチョンマーク",en:"Question mark"},inputs:{colors:[{legend:{ja:"アイコンの色",en:"Icon color"},defaultValue:i.COLOR.SILVER_DARK},{legend:{ja:"吹き出しの背景色",en:"background color of speech bubble"},defaultValue:i.COLOR.BLACK}],radios:[{legend:{ja:"アイコンの塗りつぶし",en:"Filling icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:o,radios:e}){const t=o[0];return{html:`<div class="tooltip-005">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${e[0]?`
        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM13 13.3551C14.4457 12.9248 15.5 11.5855 15.5 10C15.5 8.067 13.933 6.5 12 6.5C10.302 6.5 8.88637 7.70919 8.56731 9.31346L10.5288 9.70577C10.6656 9.01823 11.2723 8.5 12 8.5C12.8284 8.5 13.5 9.17157 13.5 10C13.5 10.8284 12.8284 11.5 12 11.5C11.4477 11.5 11 11.9477 11 12.5V14H13V13.3551Z"
              fill="${t}"></path>`:`
        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z"
              fill="${t}"></path>`}
    </svg>
    <p>ツールチップの内容</p>
</div>`,css:`.tooltip-005 {
    display: inline-block;
    position: relative;
}

.tooltip-005 svg {
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
}

.tooltip-005 p {
    display: flex;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: -43px;
    left: 50%;
    transform: translateX(-50%);
    padding: .5em 1em;
    border-radius: 3px;
    background-color: ${o[1]}99;
    color: #fff;
    font-size: .7em;
    white-space: nowrap;
    transition: opacity .3s;
}

.tooltip-005:hover > p {
    visibility: visible;
    opacity: 1;
}

.tooltip-005 p::before {
    position: absolute;
    top: -6px;
    width: 9px;
    height: 6px;
    background-color: inherit;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
    content: '';
}`}}};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['qa-8'] = (function(e){
    const m = {id:8,name:{ja:"回答に背景色あり",en:"With background color"},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:e.COLOR.SILVER},{legend:{ja:"文字色",en:"Text color"},defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc:({colors:d})=>({html:`<dl class="qa-8">
    <dt>これはどのようなテンプレートですか？</dt>
    <dd>回答に背景を付けたシンプルなQ&Aリストです。</dd>
    <dt>どのような特徴がありますか？</dt>
    <dd>背景色があることで質問と回答の区別がつきやすく、回答が長文になっても違和感を与えないデザインになります。</dd>
</dl>`,css:`.qa-8 dt {
    margin-bottom: 1em;
    color: ${d[1]};
    font-weight: 600;
}

.qa-8 dt::before,
.qa-8 dd::before {
    margin-right: .4em;
}

.qa-8 dt::before {
    content: "Q.";
}

.qa-8 dd {
    margin: 0 0 2.5em;
    padding: 1em 1.5em;
    background-color: ${d[0]};
    color: ${d[1]};
}

.qa-8 dd::before {
    content: "A.";
}`})};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['qa-6'] = (function(t){
    const m = {id:6,name:{ja:"下線あり",en:"With underline"},inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:"#d6dde3"},{legend:{ja:"文字色",en:"Text color"},defaultValue:t.COLOR.BLACK_TEXT}]},codeFunc:({colors:e})=>({html:`<details class="qa-6">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>下線付きの、アコーディオンとして開閉できるQ&Aリストです。</p>
</details>
<details class="qa-6">
    <summary>どのような特徴がありますか？</summary>
    <p>開閉できるおかげでコンパクトに見せることができます。質問の数が多い場合などにおすすめです。</p>
</details>`,css:`.qa-6 {
    max-width: 500px;
    margin-bottom: 5px;
    border-bottom: 2px solid ${e[0]};
}

.qa-6 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em 1em 3em;
    color: ${e[1]};
    font-weight: 600;
    cursor: pointer;
}

.qa-6 summary::before,
.qa-6 p::before {
    position: absolute;
    left: 1em;
    font-weight: 600;
    font-size: 1.3em;
}

.qa-6 summary::before {
    color: #75bbff;
    content: "Q";
}

.qa-6 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${e[1]}b3;
    border-right: 3px solid ${e[1]}b3;
    content: '';
    transition: transform .5s;
}

.qa-6[open] summary::after {
    transform: rotate(225deg);
}

.qa-6 p {
    position: relative;
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: .3em 3em 1.5em;
    color: #333;
    transition: transform .5s, opacity .5s;
}

.qa-6[open] p {
    transform: none;
    opacity: 1;
}

.qa-6 p::before {
    color: #ff8d8d;
    line-height: 1.2;
    content: "A";
}`})};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['qa-1'] = (function(a){
    const m = {id:1,name:{ja:"枠線あり",en:"With border"},inputs:{colors:[{legend:{ja:"枠線の色",en:"Border color"},defaultValue:"#d6dde3"},{legend:{ja:"文字色",en:"Text color"},defaultValue:a.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:a.BORDER_RADIUS["5PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:a.BORDER_RADIUS.ELLIPSE}]}]},codeFunc:({colors:e,radios:t})=>({html:`<details class="qa-1">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>アコーディオンとして開閉できるQ&Aです。コンパクトに見せることができるので、質問の数が多い場合などにおすすめです。</p>
</details>
<details class="qa-1">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>アコーディオンとして開閉できるQ&Aです。コンパクトに見せることができるので、質問の数が多い場合などにおすすめです。</p>
</details>`,css:`.qa-1 {
    max-width: 500px;
    margin-bottom: 7px;
    border: 1px solid ${e[0]};
    border-radius: ${t[0]};
}

.qa-1 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em 1em 3em;
    color: ${e[1]};
    font-weight: 600;
    cursor: pointer;
}

.qa-1 summary::before,
.qa-1 p::before {
    position: absolute;
    left: 1em;
    font-weight: 600;
    font-size: 1.3em;
}

.qa-1 summary::before {
    color: #75bbff;
    content: "Q";
}

.qa-1 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${e[1]}b3;
    border-right: 3px solid ${e[1]}b3;
    content: '';
    transition: transform .5s;
}

.qa-1[open] summary::after {
    transform: rotate(225deg);
}

.qa-1 p {
    position: relative;
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: .3em 3em 1.5em;
    color: #333;
    transition: transform .5s, opacity .5s;
}

.qa-1[open] p {
    transform: none;
    opacity: 1;
}

.qa-1 p::before {
    color: #ff8d8d;
    line-height: 1.2;
    content: "A";
}`})};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['qa-7'] = (function(e){
    const m = {id:7,name:{ja:"白背景 & シャドウ",en:"White background & shadow"},options:{bgColor:e.COLOR.SILVER},inputs:{colors:[{legend:{ja:"文字色",en:"Text color"},defaultValue:e.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:e.BORDER_RADIUS["5PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:e.BORDER_RADIUS.ELLIPSE}]}]},codeFunc:({colors:a,radios:o})=>({html:`<details class="qa-7">
    <summary>これはどのようなテンプレートですか？</summary>
    <p>白背景にシャドウを付けた、アコーディオンとして開閉できるQ&Aです。</p>
</details>
<details class="qa-7">
    <summary>どのような特徴がありますか？</summary>
    <p>コンパクトに見せられるので、質問の数が多い場合などにおすすめです。</p>
</details>`,css:`.qa-7 {
    max-width: 500px;
    margin-bottom: 10px;
    border: none;
    border-radius: ${o[0]};
    box-shadow: 0 4px 4px rgb(0 0 0 / 2%), 0 2px 3px -2px rgba(0 0 0 / 5%);
    background-color: #fff;
}

.qa-7 summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    padding: 1em 2em 1em 3em;
    color: ${a[0]};
    font-weight: 600;
    cursor: pointer;
}

.qa-7 summary::before,
.qa-7 p::before {
    position: absolute;
    left: 1em;
    font-weight: 600;
    font-size: 1.3em;
}

.qa-7 summary::before {
    color: #75bbff;
    content: "Q";
}

.qa-7 summary::after {
    transform: translateY(-25%) rotate(45deg);
    width: 7px;
    height: 7px;
    margin-left: 10px;
    border-bottom: 3px solid ${a[0]}b3;
    border-right: 3px solid ${a[0]}b3;
    content: '';
    transition: transform .5s;
}

.qa-7[open] summary::after {
    transform: rotate(225deg);
}

.qa-7 p {
    position: relative;
    transform: translateY(-10px);
    opacity: 0;
    margin: 0;
    padding: .3em 3em 1.5em;
    color: #333;
    transition: transform .5s, opacity .5s;
}

.qa-7[open] p {
    transform: none;
    opacity: 1;
}

.qa-7 p::before {
    color: #ff8d8d;
    line-height: 1.2;
    content: "A";
}`})};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['quote-1'] = (function(o, a){
    const c = {id:1,name:{ja:"スタンダード",en:"Standard"},inputs:{colors:[{legend:{ja:"左線の色",en:"Left line color"},defaultValue:o.COLOR.SILVER},{legend:{ja:"文字色",en:"Text color"},defaultValue:o.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"出典（citeタグ）",en:"Source (cite tag）"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:t}){return{html:`<blockquote class="quote-1">
    <p>左に線を付けたシンプルな引用ボックスです。</p>
    <p>ここに引用するコンテンツを入れます。ここに引用するコンテンツを入れます。</p>${t[0]?`
    <cite>出典：ここに引用元を入れる</cite>`:""}
</blockquote>`,css:`.quote-1 {
    max-width: 500px;
    padding: 1em 1.5em;
    border-left: 4px solid ${e[0]};
    color: ${e[1]};
}

.quote-1:has(cite) {
    padding-bottom: .5em;
}

.quote-1 p {
    margin-top: 0;
}

${t[0]?`.quote-1 cite {
    display: block;
    color: ${a(e[1],4)};
    font-size: .8em;
    text-align: right;
}`:`.quote-1 p:last-of-type {
   margin-bottom: 0;
}`}`}}};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['quote-2'] = (function(t, a, i){
    const m = {id:2,name:{ja:"かぎ括弧風",en:"Like angle bracket"},inputs:{colors:[{legend:{ja:"かぎ括弧の色",en:"Angle bracket color"},defaultValue:t.COLOR.BLUE},{legend:{ja:"アイコンの色",en:"Icon color"},defaultValue:t.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:t.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"出典（citeタグ）",en:"Source (cite tag）"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:o}){return{html:`<blockquote class="quote-2">
    <p>かぎ括弧で囲いアイコンを付けた、可愛らしい引用ボックスです。</p>
    <p>ここに引用するコンテンツを入れます。ここに引用するコンテンツを入れます。</p>${o[0]?`
    <cite>出典：ここに引用元を入れる</cite>`:""}
</blockquote>`,css:`.quote-2 {
    max-width: 500px;
    position: relative;
    padding: 2.5em 2.5em 2em 3em;
    color: ${e[2]};
}

.quote-2::before,
.quote-2::after {
    display: inline-block;
    position: absolute;
    width: 4em;
    height: 4em;
    content: '';
}

.quote-2::before {
    top: 0;
    left: 0;
    border-top: 3px solid ${e[0]};
    border-left: 3px solid ${e[0]};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4.58341 17.3211C3.55316 16.2274 3 15 3 13.0103C3 9.51086 5.45651 6.37366 9.03059 4.82318L9.92328 6.20079C6.58804 8.00539 5.93618 10.346 5.67564 11.822C6.21263 11.5443 6.91558 11.4466 7.60471 11.5105C9.40908 11.6778 10.8312 13.159 10.8312 15C10.8312 16.933 9.26416 18.5 7.33116 18.5C6.2581 18.5 5.23196 18.0095 4.58341 17.3211ZM14.5834 17.3211C13.5532 16.2274 13 15 13 13.0103C13 9.51086 15.4565 6.37366 19.0306 4.82318L19.9233 6.20079C16.588 8.00539 15.9362 10.346 15.6756 11.822C16.2126 11.5443 16.9156 11.4466 17.6047 11.5105C19.4091 11.6778 20.8312 13.159 20.8312 15C20.8312 16.933 19.2642 18.5 17.3312 18.5C16.2581 18.5 15.232 18.0095 14.5834 17.3211Z' fill='%23${a(e[1])}'%3E%3C/path%3E%3C/svg%3E");
    background-position: top 35% left 35%;
    background-size: 2em;
    background-repeat: no-repeat;
}

.quote-2::after {
    bottom: 0;
    right: 0;
    border-bottom: 3px solid ${e[0]};
    border-right: 3px solid ${e[0]};
}

.quote-2 p {
    margin-top: 0;
}

${o[0]?`.quote-2 cite {
    display: block;
    color: ${i(e[2],4)};
    font-size: .8em;
    text-align: right;
}`:`.quote-2 p:last-of-type {
   margin-bottom: 0;
}`}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_funcs.r, _di_funcs.a);
  root.designInserterPartCodeFuncs['quote-3'] = (function(t, a, l){
    const m = {id:3,name:{ja:"背景あり",en:"With background"},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:t.COLOR.SILVER},{legend:{ja:"アイコンの色",en:"Icon color"},defaultValue:t.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:t.COLOR.BLACK_TEXT}],radios:[{legend:{ja:"出典（citeタグ）",en:"Source (cite tag）"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:e,radios:o}){return{html:`<blockquote class="quote-3">
    <p>背景とアイコンを付けた、シンプルかつ分かりやすい引用ボックスです。</p>
    <p>ここに引用するコンテンツを入れます。ここに引用するコンテンツを入れます。</p>${o[0]?`
    <cite>出典：ここに引用元を入れる</cite>`:""}
</blockquote>`,css:`.quote-3 {
    max-width: 500px;
    position: relative;
    padding: 3em 2.5em 2em 3.5em;
    color: ${e[2]};
    background-color: ${e[0]};
}

.quote-3::before {
    display: inline-block;
    position: absolute;
    top: 1em;
    left: 1.5em;
    width: 2em;
    height: 2em;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4.58341 17.3211C3.55316 16.2274 3 15 3 13.0103C3 9.51086 5.45651 6.37366 9.03059 4.82318L9.92328 6.20079C6.58804 8.00539 5.93618 10.346 5.67564 11.822C6.21263 11.5443 6.91558 11.4466 7.60471 11.5105C9.40908 11.6778 10.8312 13.159 10.8312 15C10.8312 16.933 9.26416 18.5 7.33116 18.5C6.2581 18.5 5.23196 18.0095 4.58341 17.3211ZM14.5834 17.3211C13.5532 16.2274 13 15 13 13.0103C13 9.51086 15.4565 6.37366 19.0306 4.82318L19.9233 6.20079C16.588 8.00539 15.9362 10.346 15.6756 11.822C16.2126 11.5443 16.9156 11.4466 17.6047 11.5105C19.4091 11.6778 20.8312 13.159 20.8312 15C20.8312 16.933 19.2642 18.5 17.3312 18.5C16.2581 18.5 15.232 18.0095 14.5834 17.3211Z' fill='%23${a(e[1])}'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    content: '';
}

.quote-3 p {
    margin-top: 0;
}

${o[0]?`.quote-3 cite {
    display: block;
    color: ${l(e[2],4)};
    font-size: .8em;
    text-align: right;
}`:`.quote-3 p:last-of-type {
   margin-bottom: 0;
}`}`}}};
    return function(params){ return m.codeFunc(params); };
  })(_di_consts, _di_funcs.r, _di_funcs.a);
  root.designInserterPartCodeFuncs['quote-4'] = (function(o){
    const n = {id:4,name:{ja:"太めの左枠線",en:"Thick left border"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:o.COLOR.BLUE}],radios:[{legend:{ja:"出典（citeタグ）",en:"Source (cite tag）"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc({colors:t,radios:e}){return{html:`<blockquote class="quote-4">
    <p>左枠線を太くし、アイコンをより際立たせた引用ボックスです。</p>
    <p>ここに引用するコンテンツを入れます。ここに引用するコンテンツを入れます。</p>${e[0]?`
    <cite>出典：ここに引用元を入れる</cite>`:""}
</blockquote>`,css:`.quote-4 {
    max-width: 500px;
    position: relative;
    padding: 1em 1.5em 1em 1em;
    border: 2px solid ${t[0]};
    border-left-width: 3.5em;
    border-radius: 3px;
}

.quote-4::after {
    position: absolute;
    top: 0;
    left: -3.5em;
    width: 3.5em;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4.58341 17.3211C3.55316 16.2274 3 15 3 13.0103C3 9.51086 5.45651 6.37366 9.03059 4.82318L9.92328 6.20079C6.58804 8.00539 5.93618 10.346 5.67564 11.822C6.21263 11.5443 6.91558 11.4466 7.60471 11.5105C9.40908 11.6778 10.8312 13.159 10.8312 15C10.8312 16.933 9.26416 18.5 7.33116 18.5C6.2581 18.5 5.23196 18.0095 4.58341 17.3211ZM14.5834 17.3211C13.5532 16.2274 13 15 13 13.0103C13 9.51086 15.4565 6.37366 19.0306 4.82318L19.9233 6.20079C16.588 8.00539 15.9362 10.346 15.6756 11.822C16.2126 11.5443 16.9156 11.4466 17.6047 11.5105C19.4091 11.6778 20.8312 13.159 20.8312 15C20.8312 16.933 19.2642 18.5 17.3312 18.5C16.2581 18.5 15.232 18.0095 14.5834 17.3211Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E") no-repeat center / 2em;
    content: '';
}

.quote-4 p {
    margin-top: 0;
}

${e[0]?`.quote-4 cite {
    display: block;
    color: #777;
    font-size: .8em;
    text-align: right;
}`:`.quote-4 p:last-of-type {
   margin-bottom: 0;
}`}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['radar-chart-1'] = (function(r, d, e){
    const v = {id:1,name:{ja:"三角形",en:"Triangle"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:r.COLOR.BLUE}],ranges:[{legend:{ja:"項目1の値",en:"Item-1 value"},...d},{legend:{ja:"項目2の値",en:"Item-2 value"},...d},{legend:{ja:"項目3の値",en:"Item-3 value"},...d}]},codeFunc:({colors:a,ranges:t})=>({html:`<div class="radar-chart-1">
    ${e(a[0],t,3)}
    <dl>
        <div>
            <dt>項目1</dt>
            <dd>${t[0].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目2</dt>
            <dd>${t[1].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目3</dt>
            <dd>${t[2].toFixed(1)}</dd>
        </div>
    </dl>
</div>`,css:`.radar-chart-1 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 230px;
    height: 230px;
    margin: 0 auto;
    padding: 35px;
    box-sizing: content-box;
}

.radar-chart-1 svg {
    width: 100%;
    height: 100%;
}

.radar-chart-1 dl {
    position: absolute;
    width: 100%;
    height: 100%;
}

.radar-chart-1 dl > div {
    position: absolute;
    color: #777;
    font-size: .6em;
    text-align: center;
}

.radar-chart-1 dl > div:nth-child(1) {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.radar-chart-1 dl > div:nth-child(2) {
    bottom: 25%;
    right: 10%;
    transform: translateX(50%);
}

.radar-chart-1 dl > div:nth-child(3) {
    bottom: 25%;
    left: 10%;
    transform: translateX(-50%);
}

.radar-chart-1 dd {
    margin: 0;
}`})};
    return function(params){ return v.codeFunc(params); };
  })(_di_consts, _di_common_radar_chart.RANGES_ITEM, _di_functions_radar_chart.generateSvg);
  root.designInserterPartCodeFuncs['radar-chart-2'] = (function(r, d, e){
    const v = {id:2,name:{ja:"五角形",en:"Pentagon"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:r.COLOR.BLUE}],ranges:[{legend:{ja:"項目1の値",en:"Item-1 value"},...d},{legend:{ja:"項目2の値",en:"Item-2 value"},...d},{legend:{ja:"項目3の値",en:"Item-3 value"},...d},{legend:{ja:"項目4の値",en:"Item-4 value"},...d},{legend:{ja:"項目5の値",en:"Item-5 value"},...d}]},codeFunc:({colors:a,ranges:t})=>({html:`<div class="radar-chart-2">
    ${e(a[0],t,5)}
    <dl>
        <div>
            <dt>項目1</dt>
            <dd>${t[0].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目2</dt>
            <dd>${t[1].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目3</dt>
            <dd>${t[2].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目4</dt>
            <dd>${t[3].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目5</dt>
            <dd>${t[4].toFixed(1)}</dd>
        </div>
    </dl>
</div>`,css:`.radar-chart-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 230px;
    height: 230px;
    margin: 0 auto;
    padding: 35px;
    box-sizing: content-box;
}

.radar-chart-2 svg {
    width: 100%;
    height: 100%;
}

.radar-chart-2 dl {
    position: absolute;
    width: 100%;
    height: 100%;
}

.radar-chart-2 dl > div {
    position: absolute;
    color: #777;
    font-size: .6em;
    text-align: center;
}

.radar-chart-2 dl > div:nth-child(1) {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.radar-chart-2 dl > div:nth-child(2) {
    top: 31%;
    right: 7%;
    transform: translateX(50%);
}

.radar-chart-2 dl > div:nth-child(3) {
    bottom: 6%;
    right: 25%;
    transform: translateX(50%);
}

.radar-chart-2 dl > div:nth-child(4) {
    bottom: 6%;
    left: 25%;
    transform: translateX(-50%);
}

.radar-chart-2 dl > div:nth-child(5) {
    top: 31%;
    left: 7%;
    transform: translateX(-50%);
}

.radar-chart-2 dd {
    margin: 0;
}`})};
    return function(params){ return v.codeFunc(params); };
  })(_di_consts, _di_common_radar_chart.RANGES_ITEM, _di_functions_radar_chart.generateSvg);
  root.designInserterPartCodeFuncs['radar-chart-3'] = (function(e, d, r){
    const s = {id:3,name:{ja:"六角形",en:"Hexagon"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:e.COLOR.BLUE}],ranges:[{legend:{ja:"項目1の値",en:"Item-1 value"},...d},{legend:{ja:"項目2の値",en:"Item-2 value"},...d},{legend:{ja:"項目3の値",en:"Item-3 value"},...d},{legend:{ja:"項目4の値",en:"Item-4 value"},...d},{legend:{ja:"項目5の値",en:"Item-5 value"},...d},{legend:{ja:"項目6の値",en:"Item-6 value"},...d}]},codeFunc:({colors:a,ranges:t})=>({html:`<div class="radar-chart-3">
    ${r(a[0],t,6)}
    <dl>
        <div>
            <dt>項目1</dt>
            <dd>${t[0].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目2</dt>
            <dd>${t[1].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目3</dt>
            <dd>${t[2].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目4</dt>
            <dd>${t[3].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目5</dt>
            <dd>${t[4].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目6</dt>
            <dd>${t[5].toFixed(1)}</dd>
        </div>
    </dl>
</div>`,css:`.radar-chart-3 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 230px;
    height: 230px;
    margin: 0 auto;
    padding: 35px;
    box-sizing: content-box;
}

.radar-chart-3 svg {
    width: 100%;
    height: 100%;
}

.radar-chart-3 dl {
    position: absolute;
    width: 100%;
    height: 100%;
}

.radar-chart-3 dl > div {
    position: absolute;
    color: #777;
    font-size: .6em;
    text-align: center;
}

.radar-chart-3 dl > div:nth-child(1) {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.radar-chart-3 dl > div:nth-child(2) {
    top: 24%;
    right: 10%;
    transform: translateX(50%);
}

.radar-chart-3 dl > div:nth-child(3) {
    bottom: 24%;
    right: 10%;
    transform: translateX(50%);
}

.radar-chart-3 dl > div:nth-child(4) {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

.radar-chart-3 dl > div:nth-child(5) {
    bottom: 24%;
    left: 10%;
    transform: translateX(-50%);
}

.radar-chart-3 dl > div:nth-child(6) {
    top: 24%;
    left: 10%;
    transform: translateX(-50%);
}

.radar-chart-3 dd {
    margin: 0;
}`})};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_radar_chart.RANGES_ITEM, _di_functions_radar_chart.generateSvg);
  root.designInserterPartCodeFuncs['radar-chart-4'] = (function(e, d, r){
    const s = {id:4,name:{ja:"七角形",en:"Heptagon"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:e.COLOR.BLUE}],ranges:[{legend:{ja:"項目1の値",en:"Item-1 value"},...d},{legend:{ja:"項目2の値",en:"Item-2 value"},...d},{legend:{ja:"項目3の値",en:"Item-3 value"},...d},{legend:{ja:"項目4の値",en:"Item-4 value"},...d},{legend:{ja:"項目5の値",en:"Item-5 value"},...d},{legend:{ja:"項目6の値",en:"Item-6 value"},...d},{legend:{ja:"項目7の値",en:"Item-7 value"},...d}]},codeFunc:({colors:a,ranges:t})=>({html:`<div class="radar-chart-4">
    ${r(a[0],t,7)}
    <dl>
        <div>
            <dt>項目1</dt>
            <dd>${t[0].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目2</dt>
            <dd>${t[1].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目3</dt>
            <dd>${t[2].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目4</dt>
            <dd>${t[3].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目5</dt>
            <dd>${t[4].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目6</dt>
            <dd>${t[5].toFixed(1)}</dd>
        </div>
        <div>
            <dt>項目7</dt>
            <dd>${t[6].toFixed(1)}</dd>
        </div>
    </dl>
</div>`,css:`.radar-chart-4 {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 230px;
    height: 230px;
    margin: 0 auto;
    padding: 35px;
    box-sizing: content-box;
}

.radar-chart-4 svg {
    width: 100%;
    height: 100%;
}

.radar-chart-4 dl {
    position: absolute;
    width: 100%;
    height: 100%;
}

.radar-chart-4 dl > div {
    position: absolute;
    color: #777;
    font-size: .6em;
    text-align: center;
}

.radar-chart-4 dl > div:nth-child(1) {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.radar-chart-4 dl > div:nth-child(2) {
    top: 18%;
    right: 14%;
    transform: translateX(50%);
}

.radar-chart-4 dl > div:nth-child(3) {
    bottom: 36%;
    right: 6%;
    transform: translateX(50%);
}

.radar-chart-4 dl > div:nth-child(4) {
    bottom: 3%;
    right: 32%;
    transform: translateX(50%);
}

.radar-chart-4 dl > div:nth-child(5) {
    bottom: 3%;
    left: 32%;
    transform: translateX(-50%);
}

.radar-chart-4 dl > div:nth-child(6) {
    bottom: 36%;
    left: 6%;
    transform: translateX(-50%);
}

.radar-chart-4 dl > div:nth-child(7) {
    top: 18%;
    left: 14%;
    transform: translateX(-50%);
}

.radar-chart-4 dd {
    margin: 0;
}`})};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_radar_chart.RANGES_ITEM, _di_functions_radar_chart.generateSvg);
  root.designInserterPartCodeFuncs['read-more-1'] = (function(o, t){
    const s = {id:1,name:{ja:"リンク風",en:"Like link"},inputs:{colors:[{legend:{ja:"リンク色",en:"Link color"},defaultValue:o.COLOR.BLUE_LINK},{legend:{ja:"ホバー時のリンク色",en:"Color on hover"},defaultValue:o.COLOR.ORANGE_LINK_HOVER}],radios:[{legend:{ja:"開く時のアニメーション",en:"Animation when opening"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:e,radios:a})=>({html:`<div class="read-more-1">
    <p>
        ${t.sentence}
    </p>
    <label>
        <input type="checkbox"/>
        ...続きを読む
    </label>
</div>`,css:`.read-more-1 {
    position: relative;
}

.read-more-1 p {
    position: relative;
    max-height: 100px; /* 開く前に見せたい高さを指定 */
    margin-bottom: 0;
    overflow: hidden;${a[0]?`
    transition: max-height 1s;`:""}
}

.read-more-1:has(:checked) p {
    max-height: 100vh;
}

.read-more-1 p::after {
    display: block;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, .9) 50%, hsla(0, 0%, 100%, .9) 0, #fff);
    content: '';
}

.read-more-1:has(:checked) p::after {
    content: none;
}

.read-more-1 label {
    display: flex;
    align-items: center;
    gap: 0 4px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    color: ${e[0]};
    font-size: .8em;
}

.read-more-1 label:hover {
    color: ${e[1]};
    text-decoration: underline;
    cursor: pointer;
}

.read-more-1:has(:checked) label {
    display: none;
}

.read-more-1 label::after {
    display: inline-block;
    width: 10px;
    height: 5px;
    background-color: #b6bdc3;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.read-more-1 input {
    display: none;
}`})};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_read_more.COMMON);
  root.designInserterPartCodeFuncs['read-more-3'] = (function(a, r){
    const s = {id:3,name:{ja:"ボタン風",en:"Like button"},inputs:{colors:[{legend:{ja:"ボタン色",en:"Button color"},defaultValue:a.COLOR.BLUE}],radios:[{legend:{ja:"ボタンの形状",en:"Button shape"},choices:[{label:{ja:"四角",en:"Square"},value:"1px"},{label:{ja:"角丸",en:"Rounded corners"},value:a.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"開く時のアニメーション",en:"Animation when opening"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:e,radios:o})=>({html:`<div class="read-more-3">
    <p>
        ${r.sentence}
    </p>
    <label>
        <input type="checkbox"/>
        続きを読む
    </label>
</div>`,css:`.read-more-3 {
    position: relative;
}

.read-more-3 p {
    position: relative;
    max-height: 100px; /* 開く前に見せたい高さを指定 */
    margin-bottom: 10px;
    overflow: hidden;${o[1]?`
    transition: max-height 1s;`:""}
}

.read-more-3:has(:checked) p {
    max-height: 100vh;
}

.read-more-3 p::after {
    display: block;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, .9) 50%, hsla(0, 0%, 100%, .9) 0, #fff);
    content: '';
}

.read-more-3:has(:checked) p::after {
    content: none;
}

.read-more-3 label {
    display: flex;
    align-items: center;
    gap: 0 4px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: .4em 1.2em;
    border-radius: ${o[0]};
    background-color: ${e[0]};
    color: #fff;
    font-size: .7em;
}

.read-more-3 label:hover {
    border:1px solid ${e[0]};
    background-color: #fff;
    color: ${e[0]};
    cursor: pointer;
}

.read-more-3:has(:checked) label {
    display: none;
}

.read-more-3 label::after {
    display: inline-block;
    width: 10px;
    height: 5px;
    background-color: #fff;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.read-more-3 label:hover::after{
    background-color: ${e[0]};
}

.read-more-3 input {
    display: none;
}`})};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_common_read_more.COMMON);
  root.designInserterPartCodeFuncs['read-more-2'] = (function(o, a){
    const p = {id:2,name:{ja:"リンク風",en:"Like link"},inputs:{colors:[{legend:{ja:"リンク色",en:"Link color"},defaultValue:o.COLOR.BLUE_LINK},{legend:{ja:"ホバー時のリンク色",en:"Color on hover"},defaultValue:o.COLOR.ORANGE_LINK_HOVER}]},codeFunc:({colors:e})=>({html:`<div class="read-more-2">
    <p>
        ${a.sentence}
    </p>
    <label>
        <input type="checkbox"/>
        ...続きを読む
    </label>
</div>`,css:`.read-more-2 {
    position: relative;
}

.read-more-2 p {
    display: -webkit-box;
    position: relative;
    margin-bottom: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4; /* 開く前に見せたい行数を指定 */
}

.read-more-2:has(:checked) p {
    display: block;
}

.read-more-2 p::after {
    display: block;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, .9) 50%, hsla(0, 0%, 100%, .9) 0, #fff);
    content: '';
}

.read-more-2:has(:checked) p::after {
    content: none;
}

.read-more-2 label {
    display: flex;
    align-items: center;
    gap: 0 4px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    color: ${e[0]};
    font-size: .8em;
}

.read-more-2 label:hover {
    color: ${e[1]};
    text-decoration: underline;
    cursor: pointer;
}

.read-more-2:has(:checked) label {
    display: none;
}

.read-more-2 label::after {
    display: inline-block;
    width: 10px;
    height: 5px;
    background-color: #b6bdc3;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.read-more-2 input {
    display: none;
}`})};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_read_more.COMMON);
  root.designInserterPartCodeFuncs['read-more-4'] = (function(o, r){
    const c = {id:4,name:{ja:"ボタン風",en:"Like button"},inputs:{colors:[{legend:{ja:"ボタン色",en:"Button color"},defaultValue:o.COLOR.BLUE}],radios:[{legend:{ja:"ボタンの形状",en:"Button shape"},choices:[{label:{ja:"四角",en:"Square"},value:"1px"},{label:{ja:"角丸",en:"Rounded corners"},value:o.BORDER_RADIUS.ELLIPSE}]}]},codeFunc:({colors:e,radios:a})=>({html:`<div class="read-more-4">
    <p>
        ${r.sentence}
    </p>
    <label>
        <input type="checkbox"/>
        続きを読む
    </label>
</div>`,css:`.read-more-4 {
    position: relative;
}

.read-more-4 p {
    display: -webkit-box;
    position: relative;
    margin-bottom: 10px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4; /* 開く前に見せたい行数を指定 */
}

.read-more-4:has(:checked) p {
    display: block;
}

.read-more-4 p::after {
    display: block;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0, hsla(0, 0%, 100%, .9) 50%, hsla(0, 0%, 100%, .9) 0, #fff);
    content: '';
}

.read-more-4:has(:checked) p::after {
    content: none;
}

.read-more-4 label {
    display: flex;
    align-items: center;
    gap: 0 4px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: .4em 1.2em;
    border-radius: ${a[0]};
    background-color: ${e[0]};
    color: #fff;
    font-size: .7em;
}

.read-more-4 label:hover {
    border:1px solid ${e[0]};
    background-color: #fff;
    color: ${e[0]};
    cursor: pointer;
}

.read-more-4:has(:checked) label {
    display: none;
}

.read-more-4 label::after {
    display: inline-block;
    width: 10px;
    height: 5px;
    background-color: #fff;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: '';
}

.read-more-4 label:hover::after{
    background-color: ${e[0]};
}

.read-more-4 input {
    display: none;
}`})};
    return function(params){ return c.codeFunc(params); };
  })(_di_consts, _di_common_read_more.COMMON);
  root.designInserterPartCodeFuncs['tab-2'] = (function(e){
    const p = {id:2,name:{ja:"シンプル",en:"Simple"},inputs:{colors:[{legend:{ja:"タブの色",en:"Tab color"},defaultValue:e.COLOR.BLUE}]},codeFunc({colors:a}){return{html:`<div class="tab-2">
    <label>
        <input type="radio" name="tab-2" checked>
        タブ1
    </label>
    <div>
        背景が単色のシンプルなタブです。
        タブの文言がはっきり見えるだけでなく、色を変えることでどんなサイトにも馴染みやすいのが特徴です。
    </div>

    <label>
        <input type="radio" name="tab-2">
        タブ2
    </label>
    <div>ぜひタブの背景色をお好みのものに変えてみてください。</div>

    <label>
        <input type="radio" name="tab-2">
        タブ3
    </label>
    <div>もちろんレスポンシブ対応で、タブの追加にも対応しています。</div>
</div>`,css:`.tab-2 {
    display: flex;
    flex-wrap: wrap;
    gap: 0 10px;
    max-width: 500px;
}

.tab-2 > label {
    flex: 1 1;
    order: -1;
    opacity: .5;
    min-width: 70px;
    padding: .6em 1em;
    border-radius: 5px 5px 0 0;
    background-color: ${a[0]};
    color: #fff;
    font-size: .9em;
    text-align: center;
    cursor: pointer;
}

.tab-2 > label:hover {
    opacity: .8;
}

.tab-2 input {
    display: none;
}

.tab-2 > div {
    display: none;
    width: 100%;
    padding: 1.5em 1em;
    background-color: #fff;
}

.tab-2 label:has(:checked) {
    opacity: 1;
}

.tab-2 label:has(:checked) + div {
    display: block;
}`}}};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['tab-1'] = (function(a, o){
    const n = {id:1,name:{ja:"付箋風",en:"Like sticky note"},inputs:{colors:[{legend:{ja:"上線の色",en:"Top line color"},defaultValue:a.COLOR.BLUE},{legend:{ja:"タブ文字の色",en:"Tab text color"},defaultValue:a.COLOR.BLACK_TEXT}]},codeFunc({colors:e}){return{html:`<div class="tab-1">
    <label>
        <input type="radio" name="tab-1" checked>
        タブ1
    </label>
    <div>
        上に枠線の付いたタプです。現在表示されているタブがどれなのか判別しやすいのが特徴。
        背景が白以外の箇所で利用するとよりおしゃれに見えます。
    </div>

    <label>
        <input type="radio" name="tab-1">
        タブ2
    </label>
    <div>ぜひ線の色をお好みの色に変えてみてください。</div>

    <label>
        <input type="radio" name="tab-1">
        タブ3
    </label>
    <div>もちろんレスポンシブ対応で、タブの追加にも対応しています。</div>
</div>`,css:`.tab-1 {
    display: flex;
    flex-wrap: wrap;
    max-width: 500px;
}

.tab-1 > label {
    flex: 1 1;
    order: -1;
    min-width: 70px;
    padding: .7em 1em .5em;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 0;
    background-color: #e9f0f6;
    color: ${o(e[1],2)};
    font-size: .9em;
    text-align: center;
    cursor: pointer;
}

.tab-1 > label:hover {
    opacity: .8;
}

.tab-1 input {
    display: none;
}

.tab-1 > div {
    display: none;
    width: 100%;
    padding: 1.5em 1em;
    background-color: #fff;
}

.tab-1 label:has(:checked) {
    background-color: #fff;
    border-color: ${e[0]} #f0f0f0 #fff;
    border-style: solid;
    border-width: 4px 1px 1px;
    border-radius: 5px;
    color: ${e[1]};
}

.tab-1 label:has(:checked) + div {
    display: block;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts, _di_funcs.a);
  root.designInserterPartCodeFuncs['tab-3'] = (function(a){
    const n = {id:3,name:{ja:"下線あり",en:"With underline"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:a.COLOR.SILVER}]},codeFunc({colors:e}){return{html:`<div class="tab-3">
    <label>
        <input type="radio" name="tab-3" checked>
        タブ1
    </label>
    <div>
        アクティブになると下線が付くタブです。アクティブ時の文字色と下線の色は揃えるのがおすすめです。
    </div>

    <label>
        <input type="radio" name="tab-3">
        タブ2
    </label>
    <div>ぜひお好みの色にアレンジしてみてください。</div>

    <label>
        <input type="radio" name="tab-3">
        タブ3
    </label>
    <div>もちろんレスポンシブ対応で、タブの追加にも対応しています。</div>
</div>`,css:`.tab-3 {
    display: flex;
    flex-wrap: wrap;
    max-width: 500px;
}

.tab-3 > label {
    flex: 1 1;
    order: -1;
    min-width: 70px;
    padding: .7em 1em .5em;
    background-color: ${e[1]};
    color: #999;
    font-weight: 600;
    font-size: .9em;
    text-align: center;
    cursor: pointer;
}

.tab-3 > label:hover {
    opacity: .8;
}

.tab-3 input {
    display: none;
}

.tab-3 > div {
    display: none;
    width: 100%;
    padding: 1.5em 1em;
    background-color: #fff;
}

.tab-3 label:has(:checked) {
    border-bottom: 4px solid ${e[0]};
    color: ${e[0]};
}

.tab-3 label:has(:checked) + div {
    display: block;
}`}}};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['tab-4'] = (function(a){
    const r = {id:4,name:{ja:"吹き出し風",en:"Like speech bubble"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:a.COLOR.SILVER}],radios:[{legend:{ja:"タブ文字の太さ",en:"Tab text thickness"},choices:[{label:{ja:"細め",en:"Thin"},value:!1},{label:{ja:"太め",en:"Thick"},value:!0}]}]},codeFunc({colors:e,radios:l}){return{html:`<div class="tab-4">
    <label>
        <input type="radio" name="tab-4" checked>
        タブ1
    </label>
    <div>
        アクティブになると吹き出しのように変化するタブ。タブの内容をより際立たせたい場合などにおすすめなデザインです。
    </div>

    <label>
        <input type="radio" name="tab-4">
        タブ2
    </label>
    <div>ぜひお好みの色にアレンジしてみてください。</div>

    <label>
        <input type="radio" name="tab-4">
        タブ3
    </label>
    <div>もちろんレスポンシブ対応で、タブの追加にも対応しています。</div>
</div>`,css:`.tab-4 {
    display: flex;
    flex-wrap: wrap;
    max-width: 500px;
}

.tab-4 > label {
    flex: 1 1;
    order: -1;
    position: relative;
    min-width: 70px;
    padding: .7em 1em;
    background-color: ${e[1]};
    color: #999;${l[0]?`
            font-weight: 600;`:""}
    font-size: .9em;
    text-align: center;
    cursor: pointer;
}

.tab-4 > label:hover,
.tab-4 label:has(:checked) {
    background-color: ${e[0]};
    color: #fff;
}

.tab-4 label:has(:checked)::before {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 18px;
    height: 9px;
    background-color: ${e[0]};
    content: '';
    clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.tab-4 input {
    display: none;
}

.tab-4 > div {
    display: none;
    width: 100%;
    padding: 1.5em 1em;
}

.tab-4 label:has(:checked) + div {
    display: block;
}`}}};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['toggle-button-1'] = (function(){
    const o = {id:1,name:{ja:"iOS風",en:"Like iOS"},imgFormat:"gif",comment:{ja:"iOSで採用されているトグルボタンを再現してみました。ラベルを置く場合、ユーザーの視線移動を考慮して左側に置くのがおすすめです。",en:"I tried to reproduce the toggle button used in iOS. When placing a label, it is recommended to place it on the left side in consideration of the user's eye movement."},inputs:{colors:[{legend:{ja:"非アクティブ時の色",en:"Inactive color"},defaultValue:"#dddddd"},{legend:{ja:"アクティブ時の色",en:"Active color"},defaultValue:"#4bd865"}],radios:[{legend:{ja:"アニメーション",en:"Animation"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:e,radios:t})=>({html:`<label class="toggle-button-1">
    <input type="checkbox"/>
</label>`,css:`.toggle-button-1 {
    display: inline-block;
    position: relative;
    width: 100px;
    height: 50px;
    border-radius: 50px;
    background-color: ${e[0]};
    cursor: pointer;${t[0]?`
    transition: background-color .4s;`:""}
}

.toggle-button-1:has(:checked) {
    background-color: ${e[1]};
}

.toggle-button-1::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 0 0 5px rgb(0 0 0 / 20%);
    background-color: #fff;
    content: '';${t[0]?`
    transition: left .4s;`:""}
}

.toggle-button-1:has(:checked)::after {
    left: 50px;
}

.toggle-button-1 input {
    display: none;
}`})};
    return function(params){ return o.codeFunc(params); };
  })();
  root.designInserterPartCodeFuncs['toggle-button-2'] = (function(){
    const o = {id:2,name:{ja:"iOS風（縁あり）",en:"Like iOS（with edges）"},imgFormat:"gif",inputs:{colors:[{legend:{ja:"非アクティブ時の色",en:"Inactive color"},defaultValue:"#dddddd"},{legend:{ja:"アクティブ時の色",en:"Active color"},defaultValue:"#4bd865"}],radios:[{legend:{ja:"アニメーション",en:"Animation"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:e,radios:t})=>({html:`<label class="toggle-button-2">
    <input type="checkbox"/>
</label>`,css:`.toggle-button-2 {
    display: inline-block;
    position: relative;
    width: 100px;
    height: 50px;
    border-radius: 50px;
    border: 3px solid ${e[0]};
    box-sizing: content-box;
    cursor: pointer;${t[0]?`
    transition: border-color .4s;`:""}
}

.toggle-button-2:has(:checked) {
    border-color: ${e[1]};
}

.toggle-button-2::after {
    position: absolute;
    top: 50%;
    left: 5px;
    transform: translateY(-50%);
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: ${e[0]};
    content: '';${t[0]?`
    transition: left .4s;`:""}
}

.toggle-button-2:has(:checked)::after {
    left: 50px;
    background-color: ${e[1]};
}

.toggle-button-2 input {
    display: none;
}`})};
    return function(params){ return o.codeFunc(params); };
  })();
  root.designInserterPartCodeFuncs['toggle-button-3'] = (function(){
    const o = {id:3,name:{ja:"iOS風（背景細め）",en:"Like iOS（thin background）"},imgFormat:"gif",inputs:{colors:[{legend:{ja:"非アクティブ時の色",en:"Inactive color"},defaultValue:"#dddddd"},{legend:{ja:"アクティブ時の色",en:"Active color"},defaultValue:"#4bd865"}],radios:[{legend:{ja:"アニメーション",en:"Animation"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:e,radios:t})=>({html:`<label class="toggle-button-3">
    <input type="checkbox"/>
</label>`,css:`.toggle-button-3 {
    display: flex;
    align-items: center;
    position: relative;
    width: 100px;
    height: 25px;
    margin-top: 12.5px;
    border-radius: 50px;
    background-color: ${e[0]};
    cursor: pointer;${t[0]?`
    transition: background-color .4s;`:""}
}

.toggle-button-3:has(:checked) {
    background-color: ${e[1]};
}

.toggle-button-3::after {
    position: absolute;
    left: 0;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 0 0 5px rgb(0 0 0 / 20%);
    background: #fff;
    content: '';${t[0]?`
    transition: left .4s;`:""}
}

.toggle-button-3:has(:checked)::after {
    left: 50px;
}

.toggle-button-3 input {
    display: none;
}`})};
    return function(params){ return o.codeFunc(params); };
  })();
  root.designInserterPartCodeFuncs['toggle-button-4'] = (function(){
    const o = {id:4,name:{ja:"Yes/No",en:"Yes/No"},imgFormat:"gif",inputs:{colors:[{legend:{ja:"「No」の色",en:"「No」color"},defaultValue:"#ff8d8d"},{legend:{ja:"「Yes」の色",en:"「Yes」color"},defaultValue:"#75bbff"}],radios:[{legend:{ja:"アニメーション",en:"animation"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:e,radios:t})=>({html:`<label class="toggle-button-4">
    <input type="checkbox"/>
</label>`,css:`.toggle-button-4 {
    display: flex;
    align-items: center;
    position: relative;
    width: 100px;
    height: 50px;
    border-radius: 50px;
    box-sizing: content-box;
    background-color: ${e[0]}33;
    cursor: pointer;${t[0]?`
    transition: background-color .4s;`:""}
}

.toggle-button-4:has(:checked) {
    background-color: ${e[1]}33;
}

.toggle-button-4::before {
    position: absolute;
    left: 5px;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: ${e[0]};
    content: '';${t[0]?`
    transition: left .4s;`:""}
}

.toggle-button-4:has(:checked)::before {
    left: 50px;
    background-color: ${e[1]};
}

.toggle-button-4::after {
    position: absolute;
    left: 26px;
    transform: translateX(-50%);
    color: #fff;
    font-weight: 600;
    font-size: .9em;
    content: 'No';${t[0]?`
    transition: left .4s;`:""}
}

.toggle-button-4:has(:checked)::after {
    left: 71px;
    content: 'Yes';
}

.toggle-button-4 input {
    display: none;
}`})};
    return function(params){ return o.codeFunc(params); };
  })();
  root.designInserterPartCodeFuncs['checkbox-2'] = (function(a){
    const n = {id:2,name:{ja:"スタンダード",en:"Standard"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.BLUE}],radios:[{legend:{ja:"並びの向き",en:"Direction"},choices:[{label:{ja:"横",en:"Horizontal"},value:!0},{label:{ja:"縦",en:"Vertical"},value:!1}]},{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:a.BORDER_RADIUS["3PX"]},{label:{ja:"円",en:"Circle"},value:a.BORDER_RADIUS.HALF}]}]},codeFunc:({colors:l,radios:e})=>({html:`<fieldset class="checkbox-2">
    <label>
        <input type="checkbox" name="checkbox-2" checked/>
        radio1
    </label>
    <label>
        <input type="checkbox" name="checkbox-2"/>
        radio2
    </label>
    <label>
        <input type="checkbox" name="checkbox-2"/>
        radio3
    </label>
</fieldset>`,css:`.checkbox-2 {${e[0]?`
    display: flex;
    flex-wrap: wrap;
    gap: .5em 2em;`:""}
    border: none;
}

.checkbox-2 label {
    display: flex;
    align-items: center;
    gap: 0 .5em;
    position: relative;${e[0]?"":`
    margin-bottom: .5em;`}
    cursor: pointer;
}

.checkbox-2 label::before {
    width: 18px;
    height: 18px;
    border-radius: ${e[1]};
    border: 2px solid #d6dde3;
    content: '';
}

.checkbox-2 label:has(:checked)::after {
    position: absolute;
    top: 5px;
    left: 7px;
    transform: rotate(45deg);
    width: 5px;
    height: 10px;
    border: solid ${l[0]};
    border-width: 0 3px 3px 0;
    content: '';
}

.checkbox-2 input {
    display: none;
}`})};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['checkbox-1'] = (function(o){
    const b = {id:1,name:{ja:"背景色あり",en:"With background color"},comment:{ja:"チェック時に背景色ごと変わるチェックボックスです。白いチェックマークを際立たせるために、基調色はコントラストが強めの色にするのがおすすめです。",en:"This is a checkbox whose background color changes when checked. To make the white checkmark stand out, we recommend using a color with a strong contrast as the base color."},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:o.COLOR.BLUE}],radios:[{legend:{ja:"並びの向き",en:"Direction"},choices:[{label:{ja:"横",en:"Horizontal"},value:!0},{label:{ja:"縦",en:"Vertical"},value:!1}]},{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:o.BORDER_RADIUS["3PX"]},{label:{ja:"円",en:"Circle"},value:o.BORDER_RADIUS.HALF}]}]},codeFunc:({colors:a,radios:e})=>({html:`<fieldset class="checkbox-1">
    <label>
        <input type="checkbox" name="checkbox-1" checked/>
        radio1
    </label>
    <label>
        <input type="checkbox" name="checkbox-1"/>
        radio2
    </label>
    <label>
        <input type="checkbox" name="checkbox-1"/>
        radio3
    </label>
</fieldset>`,css:`.checkbox-1 {${e[0]?`
    display: flex;
    flex-wrap: wrap;
    gap: .5em 2em;`:""}
    border: none;
}

.checkbox-1 label {
    display: flex;
    align-items: center;
    gap: 0 .5em;
    position: relative;${e[0]?"":`
    margin-bottom: .5em;`}
    cursor: pointer;
}

.checkbox-1 label::before,
.checkbox-1 label:has(:checked)::after {
    content: '';
}

.checkbox-1 label::before {
    width: 17px;
    height: 17px;
    border-radius: ${e[1]};
    background-color: #e6edf3;
}

.checkbox-1 label:has(:checked)::before {
    background-color: ${a[0]};
}

.checkbox-1 label:has(:checked)::after {
    position: absolute;
    top: 6px;
    left: 6px;
    transform: rotate(45deg);
    width: 4px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
}

.checkbox-1 input {
    display: none;
}`})};
    return function(params){ return b.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['checkbox-3'] = (function(o){
    const i = {id:3,name:{ja:"枠線 & 背景色",en:"Border & background color"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:o.COLOR.BLUE}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:o.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:o.BORDER_RADIUS.ELLIPSE}]}]},codeFunc:({colors:e,radios:a})=>({html:`<fieldset class="checkbox-3">
    <label>
        <input type="radio" name="checkbox-3" checked/>
        radio1
    </label>
    <label>
        <input type="radio" name="checkbox-3"/>
        radio2
    </label>
    <label>
        <input type="radio" name="checkbox-3"/>
        radio3
    </label>
</fieldset>`,css:`.checkbox-3 {
    border: none;
}

.checkbox-3 label {
    display: flex;
    align-items: center;
    gap: 0 .5em;
    position: relative;
    max-width: 200px;
    margin-bottom: .4em;
    padding: .5em .7em;
    border: 1px solid ${e[0]};
    border-radius: ${a[0]};
    background-color: ${e[0]}26;
    cursor: pointer;
}

.checkbox-3 label:has(:checked) {
    background-color: ${e[0]};
    color: #fff;
}

.checkbox-3 label::before {
    width: 14px;
    height: 14px;
    border-radius: 1px;
    background-color: #fff;
    content: '';
}

.checkbox-3 label:has(:checked)::after {
    position: absolute;
    top: 14px;
    left: 15px;
    transform: rotate(45deg);
    width: 4px;
    height: 8px;
    border: solid ${e[0]};
    border-width: 0 2px 2px 0;
    content: '';
}

.checkbox-3 input {
    display: none;
}`})};
    return function(params){ return i.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['footer-1'] = (function(c){
    const r = {id:1,name:{ja:"スタンダード",en:"Standard"},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:c.COLOR.BLUE}],radios:[{legend:{ja:"リストの区切り線",en:"list separator line"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]}]},codeFunc:({colors:l,radios:e})=>({html:`<footer class="footer-001">
    <a href="#">
        <!--お好きな画像を指定してください-->
        <svg class="footer-001__logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1722.9 411.2">
            <path d="M223 310.5c-30.3 0-55.6-10.1-75.9-30.4-20.3-20.3-30.4-48.8-30.4-85.7s10.5-65 31.5-86.4c21-21.4 46.5-32.1 76.6-32.1s49.4 9.8 68.6 29.4L264.9 140c-12.9-11.9-25.9-17.8-39.2-17.8s-27.7 6.4-37.9 19.1c-10.2 12.8-15.3 29.8-15.3 51.2s4.7 39.8 14.1 52.4c9.4 12.6 22.2 18.9 38.4 18.9s30.2-6.9 43-20.8l28.5 34.1c-19.2 22.2-43.7 33.3-73.6 33.3ZM391 310.5c-15.2 0-30.3-2.8-45.1-8.3s-28-13.6-39.5-24l30.6-37.4c8.1 6.9 17.2 12.5 27.2 16.8 10 4.3 19.3 6.4 28.1 6.4 19.6 0 29.4-6.6 29.4-19.9s-4.4-12.7-13.1-17.2c-2.4-1.4-8.6-4.2-18.7-8.3l-29.1-12.2c-13.3-5.3-24.2-13.2-32.8-23.6-8.6-10.4-12.9-23.2-12.9-38.4s7.7-35.4 23.2-48.5c15.4-13.2 35-19.7 58.8-19.7s26.7 2.5 39.6 7.6c13 5 24.3 12.4 34 22.1l-27 34.1c-15.4-11.7-31-17.5-46.6-17.5s-14.9 1.7-19.7 5c-4.9 3.4-7.3 8-7.3 14s2.3 9.6 7 12.6c4.6 3.1 12.5 6.8 23.6 11.1 1.8.6 3.1 1.1 3.9 1.5l28.2 11.3c29.7 12.1 44.5 32.8 44.5 62s-7.8 36.5-23.3 50.2c-15.5 13.7-36.5 20.5-62.8 20.5ZM579.2 310.5c-15.2 0-30.3-2.8-45.1-8.3s-28-13.6-39.5-24l30.6-37.4c8.1 6.9 17.2 12.5 27.2 16.8 10 4.3 19.3 6.4 28.1 6.4 19.6 0 29.4-6.6 29.4-19.9s-4.4-12.7-13.1-17.2c-2.4-1.4-8.6-4.2-18.7-8.3L549 206.4c-13.3-5.3-24.2-13.2-32.8-23.6-8.6-10.4-12.9-23.2-12.9-38.4s7.7-35.4 23.2-48.5c15.4-13.2 35-19.7 58.8-19.7s26.7 2.5 39.6 7.6c13 5 24.3 12.4 34 22.1l-27 34.1c-15.4-11.7-31-17.5-46.6-17.5s-14.9 1.7-19.7 5c-4.9 3.4-7.3 8-7.3 14s2.3 9.6 7 12.6c4.6 3.1 12.5 6.8 23.6 11.1 1.8.6 3.1 1.1 3.9 1.5L621 178c29.7 12.1 44.5 32.8 44.5 62s-7.8 36.5-23.3 50.2c-15.5 13.7-36.5 20.5-62.8 20.5ZM842.9 310.5c-15.2 0-30.3-2.8-45.1-8.3s-28-13.6-39.5-24l30.6-37.4c8.1 6.9 17.2 12.5 27.2 16.8 10 4.3 19.3 6.4 28.1 6.4 19.6 0 29.4-6.6 29.4-19.9s-4.4-12.7-13.1-17.2c-2.4-1.4-8.6-4.2-18.7-8.3l-29.1-12.2c-13.3-5.3-24.2-13.2-32.8-23.6-8.6-10.4-12.9-23.2-12.9-38.4s7.7-35.4 23.2-48.5c15.4-13.2 35-19.7 58.8-19.7s26.7 2.5 39.6 7.6c13 5 24.3 12.4 34 22.1l-27 34.1c-15.4-11.7-31-17.5-46.6-17.5s-14.9 1.7-19.7 5c-4.9 3.4-7.3 8-7.3 14s2.3 9.6 7 12.6c4.6 3.1 12.5 6.8 23.6 11.1 1.8.6 3.1 1.1 3.9 1.5l28.2 11.3c29.7 12.1 44.5 32.8 44.5 62s-7.8 36.5-23.3 50.2c-15.5 13.7-36.5 20.5-62.8 20.5ZM1030.5 310.5c-20.8 0-36.2-6-46.2-18.1-10-12.1-15-28.8-15-50.2v-66.5h-23.5v-40.1l26.7-2.4 5.9-45.4h45.1v45.4h40.7v42.5h-40.7v65.9c0 17.8 7.2 26.7 21.7 26.7s9.1-1 16-3l8.3 38.9c-14.3 4.2-27.3 6.2-39.2 6.2ZM1169.7 310.5c-23.2 0-43.1-8.2-59.8-24.6-16.7-16.4-25.1-38.4-25.1-65.9s8.4-49.5 25.1-66.1c16.7-16.5 36.7-24.8 59.8-24.8s42.8 8.3 59.4 24.8 24.9 38.5 24.9 66.1-8.3 49.5-24.9 65.9c-16.6 16.4-36.4 24.6-59.4 24.6Zm0-43.6c19.4 0 29.1-15.6 29.1-46.9s-9.7-47.2-29.1-47.2-29.7 15.7-29.7 47.2 9.9 46.9 29.7 46.9ZM1364.5 310.5c-25.1 0-45.8-8.1-61.9-24.3-16.1-16.2-24.2-38.3-24.2-66.2s8.8-49.8 26.4-66.2c17.6-16.4 39.1-24.6 64.4-24.6s36.2 6.1 50.5 18.4l-25.2 34.7c-7.5-6.3-14.9-9.5-22.3-9.5-11.9 0-21.3 4.3-28.2 12.8-6.9 8.5-10.4 20-10.4 34.4s3.4 25.4 10.2 34c6.8 8.6 15.7 12.9 26.6 12.9s20.2-4.1 30.3-12.2l20.5 35.6c-15 13.5-33.9 20.2-56.7 20.2ZM1451.2 306.4V63.5h52.5v135.7h1.2l52.5-65.9h58.8l-61.2 71.6 65.3 101.5h-58.8l-37.1-65.6-20.8 23.5v42.2h-52.5Z"
                  fill="#fff"/>
        </svg>
    </a>
    <nav>
        <ul class="footer-001__list">
            <li><a href="#" class="footer-001__link">Link1</a></li>
            <li><a href="#" class="footer-001__link">Link2</a></li>
            <li><a href="#" class="footer-001__link">Link3</a></li>
            <li><a href="#" class="footer-001__link">Link4</a></li>
            <li><a href="#" class="footer-001__link">Link5</a></li>
        </ul>
    </nav>
    <p class="footer-001__copyright">@ 2023 CSS Stock All rights reserved.</p>
</footer>`,css:`.footer-001 {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 25px 10px 10px;
    background-color: ${l[0]};
}

.footer-001__logo {
    width: 130px;
    height: 30px;
}

.footer-001__list {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0 1.5em;
    list-style-type: none;
    margin: 0 0 .5em;
    padding: .5em;
}

.footer-001__link {
    color: #fff;
    font-weight: 200;
    text-decoration: none;
}${e[0]?`

.footer-001__list li:not(:last-of-type) .footer-001__link::after {
    margin-left: 1em;
    content: "/";
}`:""}

.footer-001__copyright {
    margin: 0;
    color: #ffffffb3;
    font-weight: 200;
    font-size: .8em;
}`})};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['footer-2'] = (function(s){
    const e = {id:2,name:{ja:"SNSリンクあり",en:"With SNS link"},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:s.COLOR.BLUE}]},codeFunc:({colors:c})=>({html:`<footer class="footer-2">
    <a href="#">
        <!--お好きな画像を指定してください-->
        <svg class="footer-2__logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1722.9 411.2">
            <path d="M223 310.5c-30.3 0-55.6-10.1-75.9-30.4-20.3-20.3-30.4-48.8-30.4-85.7s10.5-65 31.5-86.4c21-21.4 46.5-32.1 76.6-32.1s49.4 9.8 68.6 29.4L264.9 140c-12.9-11.9-25.9-17.8-39.2-17.8s-27.7 6.4-37.9 19.1c-10.2 12.8-15.3 29.8-15.3 51.2s4.7 39.8 14.1 52.4c9.4 12.6 22.2 18.9 38.4 18.9s30.2-6.9 43-20.8l28.5 34.1c-19.2 22.2-43.7 33.3-73.6 33.3ZM391 310.5c-15.2 0-30.3-2.8-45.1-8.3s-28-13.6-39.5-24l30.6-37.4c8.1 6.9 17.2 12.5 27.2 16.8 10 4.3 19.3 6.4 28.1 6.4 19.6 0 29.4-6.6 29.4-19.9s-4.4-12.7-13.1-17.2c-2.4-1.4-8.6-4.2-18.7-8.3l-29.1-12.2c-13.3-5.3-24.2-13.2-32.8-23.6-8.6-10.4-12.9-23.2-12.9-38.4s7.7-35.4 23.2-48.5c15.4-13.2 35-19.7 58.8-19.7s26.7 2.5 39.6 7.6c13 5 24.3 12.4 34 22.1l-27 34.1c-15.4-11.7-31-17.5-46.6-17.5s-14.9 1.7-19.7 5c-4.9 3.4-7.3 8-7.3 14s2.3 9.6 7 12.6c4.6 3.1 12.5 6.8 23.6 11.1 1.8.6 3.1 1.1 3.9 1.5l28.2 11.3c29.7 12.1 44.5 32.8 44.5 62s-7.8 36.5-23.3 50.2c-15.5 13.7-36.5 20.5-62.8 20.5ZM579.2 310.5c-15.2 0-30.3-2.8-45.1-8.3s-28-13.6-39.5-24l30.6-37.4c8.1 6.9 17.2 12.5 27.2 16.8 10 4.3 19.3 6.4 28.1 6.4 19.6 0 29.4-6.6 29.4-19.9s-4.4-12.7-13.1-17.2c-2.4-1.4-8.6-4.2-18.7-8.3L549 206.4c-13.3-5.3-24.2-13.2-32.8-23.6-8.6-10.4-12.9-23.2-12.9-38.4s7.7-35.4 23.2-48.5c15.4-13.2 35-19.7 58.8-19.7s26.7 2.5 39.6 7.6c13 5 24.3 12.4 34 22.1l-27 34.1c-15.4-11.7-31-17.5-46.6-17.5s-14.9 1.7-19.7 5c-4.9 3.4-7.3 8-7.3 14s2.3 9.6 7 12.6c4.6 3.1 12.5 6.8 23.6 11.1 1.8.6 3.1 1.1 3.9 1.5L621 178c29.7 12.1 44.5 32.8 44.5 62s-7.8 36.5-23.3 50.2c-15.5 13.7-36.5 20.5-62.8 20.5ZM842.9 310.5c-15.2 0-30.3-2.8-45.1-8.3s-28-13.6-39.5-24l30.6-37.4c8.1 6.9 17.2 12.5 27.2 16.8 10 4.3 19.3 6.4 28.1 6.4 19.6 0 29.4-6.6 29.4-19.9s-4.4-12.7-13.1-17.2c-2.4-1.4-8.6-4.2-18.7-8.3l-29.1-12.2c-13.3-5.3-24.2-13.2-32.8-23.6-8.6-10.4-12.9-23.2-12.9-38.4s7.7-35.4 23.2-48.5c15.4-13.2 35-19.7 58.8-19.7s26.7 2.5 39.6 7.6c13 5 24.3 12.4 34 22.1l-27 34.1c-15.4-11.7-31-17.5-46.6-17.5s-14.9 1.7-19.7 5c-4.9 3.4-7.3 8-7.3 14s2.3 9.6 7 12.6c4.6 3.1 12.5 6.8 23.6 11.1 1.8.6 3.1 1.1 3.9 1.5l28.2 11.3c29.7 12.1 44.5 32.8 44.5 62s-7.8 36.5-23.3 50.2c-15.5 13.7-36.5 20.5-62.8 20.5ZM1030.5 310.5c-20.8 0-36.2-6-46.2-18.1-10-12.1-15-28.8-15-50.2v-66.5h-23.5v-40.1l26.7-2.4 5.9-45.4h45.1v45.4h40.7v42.5h-40.7v65.9c0 17.8 7.2 26.7 21.7 26.7s9.1-1 16-3l8.3 38.9c-14.3 4.2-27.3 6.2-39.2 6.2ZM1169.7 310.5c-23.2 0-43.1-8.2-59.8-24.6-16.7-16.4-25.1-38.4-25.1-65.9s8.4-49.5 25.1-66.1c16.7-16.5 36.7-24.8 59.8-24.8s42.8 8.3 59.4 24.8 24.9 38.5 24.9 66.1-8.3 49.5-24.9 65.9c-16.6 16.4-36.4 24.6-59.4 24.6Zm0-43.6c19.4 0 29.1-15.6 29.1-46.9s-9.7-47.2-29.1-47.2-29.7 15.7-29.7 47.2 9.9 46.9 29.7 46.9ZM1364.5 310.5c-25.1 0-45.8-8.1-61.9-24.3-16.1-16.2-24.2-38.3-24.2-66.2s8.8-49.8 26.4-66.2c17.6-16.4 39.1-24.6 64.4-24.6s36.2 6.1 50.5 18.4l-25.2 34.7c-7.5-6.3-14.9-9.5-22.3-9.5-11.9 0-21.3 4.3-28.2 12.8-6.9 8.5-10.4 20-10.4 34.4s3.4 25.4 10.2 34c6.8 8.6 15.7 12.9 26.6 12.9s20.2-4.1 30.3-12.2l20.5 35.6c-15 13.5-33.9 20.2-56.7 20.2ZM1451.2 306.4V63.5h52.5v135.7h1.2l52.5-65.9h58.8l-61.2 71.6 65.3 101.5h-58.8l-37.1-65.6-20.8 23.5v42.2h-52.5Z"
                  fill="#fff"/>
        </svg>
    </a>
    <nav>
        <ul class="footer-2__list">
            <li>
                <a href="#">
                    <svg class="footer-2__sns-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#fff"
                              d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"/>
                    </svg>
                </a>
            </li>
            <li>
                <a href="#">
                    <svg class="footer-2__sns-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#ffffff"
                              d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                </a>
            </li>
            <li>
                <a href="#">
                    <svg class="footer-2__sns-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#ffffff"
                              d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"/>
                    </svg>
                </a>
            </li>
            <li>
                <a href="#">
                    <svg class="footer-2__sns-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#fff"
                              d="M18.663 10.84a.526.526 0 0 1-.526.525h-1.462v.938h1.462a.525.525 0 1 1 0 1.049H16.15a.526.526 0 0 1-.522-.524V8.852c0-.287.235-.525.525-.525h1.988a.525.525 0 0 1-.003 1.05h-1.462v.938h1.462c.291 0 .526.237.526.525zm-4.098 2.485a.538.538 0 0 1-.166.025.515.515 0 0 1-.425-.208l-2.036-2.764v2.45a.525.525 0 0 1-1.047 0V8.852a.522.522 0 0 1 .52-.523c.162 0 .312.086.412.211l2.052 2.775V8.852c0-.287.235-.525.525-.525.287 0 .525.238.525.525v3.976a.524.524 0 0 1-.36.497zm-4.95.027a.526.526 0 0 1-.523-.524V8.852c0-.287.236-.525.525-.525.289 0 .524.238.524.525v3.976a.527.527 0 0 1-.526.524zm-1.53 0H6.098a.528.528 0 0 1-.525-.524V8.852a.527.527 0 0 1 1.05 0v3.45h1.464a.525.525 0 0 1 0 1.05zM12 2.572c-5.513 0-10 3.643-10 8.118 0 4.01 3.558 7.369 8.363 8.007.325.068.769.215.881.492.1.25.066.638.032.9l-.137.85c-.037.25-.2.988.874.537 1.076-.449 5.764-3.398 7.864-5.812C21.313 14.089 22 12.477 22 10.69c0-4.475-4.488-8.118-10-8.118z"/>
                    </svg>
                </a>
            </li>
            <li>
                <a href="#">
                    <svg class="footer-2__sns-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#fff"
                              d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"/>
                    </svg>
                </a>
            </li>
        </ul>
    </nav>
    <p class="footer-2__copyright">@ 2023 CSS Stock All rights reserved.</p>
</footer>`,css:`.footer-2 {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 25px 10px 10px;
    background-color: ${c[0]};
}

.footer-2__logo {
    width: 130px;
    height: 30px;
}

.footer-2__list {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0 1.5em;
    list-style-type: none;
    margin: 0 0 .5em;
    padding: .5em;
}

.footer-2__sns-icon {
    width: 21px;
    height: 21px;
}

.footer-2__copyright {
    margin: 0;
    color: #ffffffb3;
    font-weight: 200;
    font-size: .8em;
}`})};
    return function(params){ return e.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['footer-3'] = (function(o){
    const r = {id:3,name:{ja:"コーポレート風",en:"Corporate style"},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:o.COLOR.WHITE}],radios:[{legend:{ja:"ロゴ下のキャプション",en:"Caption below logo"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},options:{bgColor:o.COLOR.SILVER},codeFunc:({colors:e,radios:l})=>({html:`<footer class="footer-3">
    <div class="footer-3__container">
        <div class="footer-3__head">
            <a href="#">
                <!--お好きな画像を指定してください-->
                <svg class="footer-3__logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 261.8 43">
                    <path d="M18.5 43c-5.3 0-9.7-1.8-13.2-5.3S0 29.2 0 22.8s1.8-11.3 5.5-15c3.7-3.7 8.1-5.6 13.3-5.6s8.6 1.7 11.9 5.1l-5 6c-2.2-2.1-4.5-3.1-6.8-3.1s-4.8 1.1-6.6 3.3c-1.8 2.2-2.7 5.2-2.7 8.9s.8 6.9 2.5 9.1c1.6 2.2 3.9 3.3 6.7 3.3s5.3-1.2 7.5-3.6l5 5.9c-3.3 3.9-7.6 5.8-12.8 5.8ZM47.8 43c-2.7 0-5.3-.5-7.9-1.4S35 39.2 33 37.4l5.3-6.5c1.4 1.2 3 2.2 4.7 2.9 1.7.7 3.4 1.1 4.9 1.1 3.4 0 5.1-1.2 5.1-3.5s-.8-2.2-2.3-3c-.4-.2-1.5-.7-3.3-1.4l-5.1-2.1c-2.3-.9-4.2-2.3-5.7-4.1-1.5-1.8-2.2-4-2.2-6.7s1.3-6.2 4-8.5 6.1-3.4 10.2-3.4 4.6.4 6.9 1.3c2.3.9 4.2 2.2 5.9 3.9l-4.7 5.9c-2.7-2-5.4-3.1-8.1-3.1s-2.6.3-3.4.9c-.8.6-1.3 1.4-1.3 2.4s.4 1.7 1.2 2.2c.8.5 2.2 1.2 4.1 1.9.3.1.5.2.7.3l4.9 2c5.2 2.1 7.8 5.7 7.8 10.8s-1.4 6.4-4.1 8.7c-2.7 2.4-6.4 3.6-10.9 3.6ZM80.5 43c-2.7 0-5.3-.5-7.9-1.4s-4.9-2.4-6.9-4.2l5.3-6.5c1.4 1.2 3 2.2 4.7 2.9 1.7.7 3.4 1.1 4.9 1.1 3.4 0 5.1-1.2 5.1-3.5s-.8-2.2-2.3-3c-.4-.2-1.5-.7-3.3-1.4L75 24.9c-2.3-.9-4.2-2.3-5.7-4.1-1.5-1.8-2.2-4-2.2-6.7s1.3-6.2 4-8.5 6.1-3.4 10.2-3.4 4.6.4 6.9 1.3c2.3.9 4.2 2.2 5.9 3.9l-4.7 5.9c-2.7-2-5.4-3.1-8.1-3.1s-2.6.3-3.4.9c-.8.6-1.3 1.4-1.3 2.4s.4 1.7 1.2 2.2c.8.5 2.2 1.2 4.1 1.9.3.1.5.2.7.3l4.9 2c5.2 2.1 7.8 5.7 7.8 10.8s-1.4 6.4-4.1 8.7c-2.7 2.4-6.4 3.6-10.9 3.6ZM126.5 43c-2.7 0-5.3-.5-7.9-1.4s-4.9-2.4-6.9-4.2l5.3-6.5c1.4 1.2 3 2.2 4.7 2.9 1.7.7 3.4 1.1 4.9 1.1 3.4 0 5.1-1.2 5.1-3.5s-.8-2.2-2.3-3c-.4-.2-1.5-.7-3.3-1.4l-5.1-2.1c-2.3-.9-4.2-2.3-5.7-4.1-1.5-1.8-2.2-4-2.2-6.7s1.3-6.2 4-8.5 6.1-3.4 10.2-3.4 4.6.4 6.9 1.3c2.3.9 4.2 2.2 5.9 3.9l-4.7 5.9c-2.7-2-5.4-3.1-8.1-3.1s-2.6.3-3.4.9c-.8.6-1.3 1.4-1.3 2.4s.4 1.7 1.2 2.2c.8.5 2.2 1.2 4.1 1.9.3.1.5.2.7.3l4.9 2c5.2 2.1 7.8 5.7 7.8 10.8s-1.4 6.4-4.1 8.7c-2.7 2.4-6.4 3.6-10.9 3.6ZM159.1 43c-3.6 0-6.3-1.1-8-3.2-1.7-2.1-2.6-5-2.6-8.7V19.5h-4.1v-7l4.7-.4 1-7.9h7.9v7.9h7.1v7.4H158V31c0 3.1 1.3 4.7 3.8 4.7s1.6-.2 2.8-.5L166 42c-2.5.7-4.8 1.1-6.8 1.1ZM183.4 43c-4 0-7.5-1.4-10.4-4.3-2.9-2.9-4.4-6.7-4.4-11.5s1.5-8.6 4.4-11.5c2.9-2.9 6.4-4.3 10.4-4.3s7.4 1.4 10.3 4.3c2.9 2.9 4.3 6.7 4.3 11.5s-1.4 8.6-4.3 11.5c-2.9 2.9-6.3 4.3-10.3 4.3Zm0-7.6c3.4 0 5.1-2.7 5.1-8.2s-1.7-8.2-5.1-8.2-5.2 2.7-5.2 8.2 1.7 8.2 5.2 8.2ZM217.3 43c-4.4 0-8-1.4-10.8-4.2-2.8-2.8-4.2-6.7-4.2-11.5s1.5-8.7 4.6-11.5c3.1-2.9 6.8-4.3 11.2-4.3s6.3 1.1 8.8 3.2l-4.4 6c-1.3-1.1-2.6-1.7-3.9-1.7-2.1 0-3.7.7-4.9 2.2-1.2 1.5-1.8 3.5-1.8 6s.6 4.4 1.8 5.9c1.2 1.5 2.7 2.2 4.6 2.2s3.5-.7 5.3-2.1l3.6 6.2c-2.6 2.3-5.9 3.5-9.9 3.5ZM232.4 42.3V0h9.2v23.6h.2l9.2-11.5h10.2l-10.6 12.5L262 42.3h-10.2l-6.5-11.4-3.6 4.1v7.3h-9.2Z"
                          fill="#2589d0"/>
                </svg>
            </a>${l[0]?`
            <p class="footer-3__caption">Web制作を楽にする<br/>UIコピペサイト</p>`:""}
        </div>
        <nav>
            <p class="footer-3__title">Title1</p>
            <ul class="footer-3__list">
                <li><a href="#" class="footer-3__link">Link1</a></li>
                <li><a href="#" class="footer-3__link">Link2</a></li>
                <li><a href="#" class="footer-3__link">Link3</a></li>
            </ul>
        </nav>
        <nav>
            <p class="footer-3__title">Title2</p>
            <ul class="footer-3__list">
                <li><a href="#" class="footer-3__link">Link1</a></li>
                <li><a href="#" class="footer-3__link">Link2</a></li>
                <li><a href="#" class="footer-3__link">Link3</a></li>
            </ul>
        </nav>
        <nav>
            <p class="footer-3__title">Title3</p>
            <ul class="footer-3__list">
                <li><a href="#" class="footer-3__link">Link1</a></li>
                <li><a href="#" class="footer-3__link">Link2</a></li>
                <li><a href="#" class="footer-3__link">Link3</a></li>
            </ul>
        </nav>
        <nav>
            <p class="footer-3__title">Title4</p>
            <ul class="footer-3__list">
                <li><a href="#" class="footer-3__link">Link1</a></li>
                <li><a href="#" class="footer-3__link">Link2</a></li>
                <li><a href="#" class="footer-3__link">Link3</a></li>
            </ul>
        </nav>
    </div>
</footer>`,css:`.footer-3 {
    padding: 3rem 2rem 1.5rem;
    background-color: ${e[0]};
}

.footer-3__container {
    display: grid;
    justify-items: center;
    grid-template-columns: repeat(5, 1fr);
    max-width: 1200px;
    margin: 0 auto;
}

.footer-3__logo {
    width: 104px;
    height: 26px;
    margin-bottom: .2em;
}${l[0]?`

.footer-3__caption {
    margin-top: 0;
    color: #a6adb3;
    font-size: .75em;
}`:""}

.footer-3__title,
.footer-3__link {
    margin: 0 0 .8em;
    color: #333;
    font-size: .9em;
}

.footer-3__title {
    font-weight: 600;
}

.footer-3__list {
    padding: 0;
    list-style-type: none;
}

.footer-3__link {
    display: block;
}

.footer-3__link:not(:hover) {
    text-decoration: none;
}

@media only screen and (max-width: 768px) {
    .footer-3__container {
        justify-items: start;
        grid-template-columns: repeat(2, 1fr);
        gap: 1em;
    }

    .footer-3__head {
        grid-column: 1/3;
    }${l[0]?`

    .footer-3__caption br {
        display: none;
    }`:""}
}`})};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['fusen-1'] = (function(o){
    const d = {id:1,name:{ja:"単色",en:"Monochromatic"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:"#a9ceec"},{legend:{ja:"文字色",en:"Text color"},defaultValue:o.COLOR.BLACK_TEXT}]},codeFunc:({colors:e})=>({html:'<div class="fusen-1">おしゃれな付箋デザイン</div>',css:`.fusen-1 {
    display: inline-block;
    position: relative;
    padding: .5em 1.3em .5em 1em;
    background-color: ${e[0]};
    color: ${e[1]};
}

.fusen-1::before {
    position: absolute;
    bottom: -1px;
    right: 9px;
    z-index: -1;
    transform: rotate(5deg);
    width: 70%;
    height: 50%;
    background-color: #d0d0d0;
    content: "";
    filter: blur(4px);
}`})};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['fusen-2'] = (function(e){
    const d = {id:2,name:{ja:"先端色あり",en:"With tip color"},inputs:{colors:[{legend:{ja:"右先端の色",en:"Right tip color"},defaultValue:e.COLOR.BLUE},{legend:{ja:"文字色",en:"Text color"},defaultValue:e.COLOR.BLACK_TEXT}]},codeFunc:({colors:o})=>({html:'<div class="fusen-2">おしゃれな付箋デザイン</div>',css:`.fusen-2 {
    display: inline-block;
    position: relative;
    padding: .5em 1em;
    border-right: 27px solid ${o[0]};
    background-color: #f5f5f5;
    color: ${o[1]};
}

.fusen-2::before {
    position: absolute;
    bottom: 2px;
    right: -20px;
    z-index: -1;
    transform: rotate(5deg);
    width: 100%;
    height: 50%;
    background-color: #d0d0d0;
    content: "";
    filter: blur(4px);
}`})};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['fusen-3'] = (function(){
    const o = {id:3,name:{ja:"単色",en:"Monochromatic"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:"#a9ceec"}]},codeFunc:({colors:e})=>({html:`<div class="fusen-3">
    おしゃれな付箋デザイン
    おしゃれな付箋デザイン
    おしゃれな付箋デザイン
    おしゃれな付箋デザイン
</div>`,css:`.fusen-3 {
    display: flex;
    align-items: center;
    position: relative;
    width: 240px;
    height: 240px;
    padding: 2em 2.2em;
    background-color: ${e[0]};
    color: #333333;
}

.fusen-3::before {
    position: absolute;
    bottom: -5px;
    right: 7px;
    z-index: -1;
    transform: rotate(5deg);
    width: 70%;
    height: 50%;
    background-color: #d0d0d0;
    content: "";
    filter: blur(4px);
}`})};
    return function(params){ return o.codeFunc(params); };
  })();
  root.designInserterPartCodeFuncs['pagination-1'] = (function(i){
    const p = {id:1,name:{ja:"単色",en:"Monochromatic"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:i.COLOR.BLUE}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"正方形",en:"Square"},value:"1px"},{label:{ja:"円",en:"Circle"},value:i.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"「前へ・次へ」ボタン",en:'"Previous/Next" button'},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]}]},codeFunc:({colors:e,radios:a})=>({html:`<ol class="pagination-1">
    <li class="prev"><a href="#">${a[1]?"前へ":"<"}</a></li>
    <li><a href="#">1</a></li>
    <li class="current"><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
    <li class="next"><a href="#">${a[1]?"次へ":">"}</a></li>
</ol>`,css:`.pagination-1 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0 8px;
    list-style-type: none;
    padding: 0;
}

.pagination-1 a {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2em;
    height: 2em;
    border: 1px solid ${e[0]};
    border-radius: ${a[0]};
    color: ${e[0]};
}

.pagination-1 a:not(:hover) {
    text-decoration: none;
}

.pagination-1 .current a {
    background-color: ${e[0]};
    color: #fff;
    pointer-events: none;
}${a[1]?`

.pagination-1 .prev a,
.pagination-1 .next a {
    gap: 0 4px;
    width: auto;
    padding: .5em .8em;
    line-height: 1;
}

.pagination-1 .prev a::before,
.pagination-1 .next a::after {
    display: inline-block;
    transform: rotate(45deg);
    width: .3em;
    height: .3em;
    content: '';
}

.pagination-1 .prev a::before {
    border-bottom: 1px solid ${e[0]};
    border-left: 1px solid ${e[0]};
}

.pagination-1 .next a::after {
    border-top: 1px solid ${e[0]};
    border-right: 1px solid ${e[0]};
}`:""}`})};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['pagination-2'] = (function(i){
    const p = {id:2,name:{ja:"灰色背景",en:"Gray background"},inputs:{colors:[{legend:{ja:"文字色",en:"Word color"},defaultValue:i.COLOR.BLUE}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"正方形",en:"Square"},value:"1px"},{label:{ja:"円",en:"Circle"},value:i.BORDER_RADIUS.ELLIPSE}]},{legend:{ja:"「前へ・次へ」ボタン",en:'"Previous/Next" button'},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]}]},codeFunc:({colors:e,radios:a})=>({html:`<ol class="pagination-2">
    <li class="prev"><a href="#">${a[1]?"前へ":"<"}</a></li>
    <li><a href="#">1</a></li>
    <li class="current"><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
    <li class="next"><a href="#">${a[1]?"次へ":">"}</a></li>
</ol>`,css:`.pagination-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0 8px;
    list-style-type: none;
    padding: 0;
}

.pagination-2 a {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2em;
    height: 2em;
    border-radius: ${a[0]};
    background-color: #f2f2f2;
    color: ${e[0]};
}

.pagination-2 a:not(:hover) {
    text-decoration: none;
}

.pagination-2 .current a {
    background-color: ${e[0]};
    color: #fff;
    pointer-events: none;
}${a[1]?`

.pagination-2 .prev a,
.pagination-2 .next a {
    gap: 0 4px;
    width: auto;
    padding: .5em .8em;
    line-height: 1;
}

.pagination-2 .prev a::before,
.pagination-2 .next a::after {
    display: inline-block;
    transform: rotate(45deg);
    width: .3em;
    height: .3em;
    content: '';
}

.pagination-2 .prev a::before {
    border-bottom: 1px solid ${e[0]};
    border-left: 1px solid ${e[0]};
}

.pagination-2 .next a::after {
    border-top: 1px solid ${e[0]};
    border-right: 1px solid ${e[0]};
}`:""}`})};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['pagination-3'] = (function(i){
    const p = {id:3,name:{ja:"下線付き",en:"With underline"},imgFormat:"svg",inputs:{colors:[{legend:{ja:"下線の色",en:"Underline color"},defaultValue:i.COLOR.SILVER},{legend:{ja:"下線（アクティブ）の色",en:"Underline (active) color"},defaultValue:i.COLOR.BLUE}],radios:[{legend:{ja:"「前へ・次へ」ボタン",en:'"Previous/Next" button'},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]}]},codeFunc:({colors:a,radios:e})=>({html:`<ol class="pagination-3">
    <li class="prev"><a href="#">${e[0]?"前へ":"<"}</a></li>
    <li><a href="#">1</a></li>
    <li class="current"><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
    <li class="next"><a href="#">${e[0]?"次へ":">"}</a></li>
</ol>`,css:`.pagination-3 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0 8px;
    list-style-type: none;
    padding: 0;
}

.pagination-3 a {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2em;
    height: 2em;
    border-bottom: 2px solid ${a[0]};
    color: #333;
    text-decoration: none;
}

.pagination-3 .current a {
    border-bottom: 2px solid ${a[1]};
    pointer-events: none;
}${e[0]?`

.pagination-3 .prev a,
.pagination-3 .next a {
    gap: 0 4px;
    width: auto;
    padding: .5em .8em;
    line-height: 1;
}

.pagination-3 .prev a::before,
.pagination-3 .next a::after {
    display: inline-block;
    transform: rotate(45deg);
    width: .3em;
    height: .3em;
    content: '';
}

.pagination-3 .prev a::before {
    border-bottom: 1px solid #333;
    border-left: 1px solid #333;
}

.pagination-3 .next a::after {
    border-top: 1px solid #333;
    border-right: 1px solid #333;
}`:""}`})};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['pie-chart-1'] = (function(i, n){
    const d = {id:1,name:{ja:"スタンダード",en:"Standard"},comment:{ja:"CSSの「conic-gradient」というプロパティ1つで描ける円グラフ。jsどころからSVGすら使わずに作れるお手軽さが特徴です。",en:'A pie chart that can be drawn with a single CSS property called "conic-gradient". The feature is that it is easy to create without even using SVG from JS.'},inputs:{colors:[{legend:{ja:"グラフの色",en:"Graph color"},defaultValue:i.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:i.COLOR.SILVER}],radios:[{legend:{ja:"割合の表示",en:"rate display"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}],ranges:[{legend:{ja:"割合",en:"rate"},defaultValue:60,min:0,max:100,step:.1,unit:{ja:"%",en:"%"}}]},codeFunc:({colors:t,radios:e,ranges:a})=>({html:`<div class="pie-chart-1">${e[0]?`
    <span>${a[0]}%</span>
`:""}</div>`,css:`.pie-chart-1 {${e[0]?`
    position: relative;`:""}
    width: 200px;
    height: 200px;
    margin: 0 auto;
    border-radius: 50%;
    background-image: conic-gradient(${t[0]} ${a[0]}%, ${t[1]} ${a[0]}% 100%);${e[0],""}
}${e[0]?`

.pie-chart-1 span {
    position: absolute;
    ${n(a[0])}
    transform: translate(50%, -50%);
    color: #fff;
    font-weight: 600;
    font-size: 1.1em;
}`:""}`})};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts, _di_functions_pie_chart.getTextPositionStyle);
  root.designInserterPartCodeFuncs['pie-chart-3'] = (function(n){
    const h = {id:3,name:{ja:"項目×2",en:"2 items"},comment:{ja:"項目を2つ設定できるようにした円グラフ。右に並ぶ凡例のおかげで各項目が分かりやすくなってはいますが、こちらの有無に関してはお好みでどうぞ。",en:"A pie chart that allows you to set two items. The legends on the right make each item easier to understand, but it's up to you to decide whether to include them or not."},inputs:{colors:[{legend:{ja:"項目1の色",en:"Item-1 color"},defaultValue:n.COLOR.BLUE},{legend:{ja:"項目2の色",en:"Item-2 color"},defaultValue:"#5ba9f7"},{legend:{ja:"背景色",en:"Background color"},defaultValue:n.COLOR.SILVER}],radios:[{legend:{ja:"凡例",en:"legend"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}],ranges:[{legend:{ja:"項目1の割合",en:"Rate of item-1"},defaultValue:70,min:0,max:100,step:.1,unit:{ja:"%",en:"%"}},{legend:{ja:"項目2の割合",en:"Rate of item-2"},defaultValue:20,min:0,max:100,step:.1,unit:{ja:"%",en:"%"}}]},codeFunc:({colors:e,radios:a,ranges:t})=>{const i=t[0]+t[1];return{html:a[0]?`<div class="pie-chart-3">
    <div></div>
    <ol>
        <li><span>項目1</span>${t[0]}%</li>
        <li><span>項目2</span>${t[1]}%</li>
    </ol>
</div>`:'<div class="pie-chart-3"></div>',css:`${a[0]?`.pie-chart-3 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.pie-chart-3 > div {
    width: 200px;
    height: 200px;
    margin: 0;
    border-radius: 50%;
    background-image: conic-gradient(${e[0]} ${t[0]}%, ${e[1]} ${t[0]}% ${i}%, ${e[2]} ${i}% 100%);
}`:`.pie-chart-3 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 200px;
    margin: 0;
    border-radius: 50%;
    background-image: conic-gradient(${e[0]} ${t[0]}%, ${e[1]} ${t[0]}% ${i}%, ${e[2]} ${i}% 100%);
}`}${a[0]?`

.pie-chart-3 li {
    display: flex;
    list-style-type: none;
    align-items: center;
    font-size: .8em;
}

.pie-chart-3 li::before {
    display: inline-block;
    width: 1.2em;
    height: .8em;
    margin-right: 5px;
    content: '';
}

.pie-chart-3 li:nth-child(1)::before {
    background-color: ${e[0]};
}

.pie-chart-3 li:nth-child(2)::before {
    background-color: ${e[1]};
}

.pie-chart-3 span {
    margin-right: 10px;
    font-weight: 600;
}`:""}`}}};
    return function(params){ return h.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['pie-chart-2'] = (function(a){
    const l = {id:2,name:{ja:"スタンダード",en:"Standard"},comment:{ja:"ドーナツのように、真ん中に穴を空けた円グラフ。グラフだけでなくテキストも目立たせたい場合におすすめです。",en:"A pie chart with a hole in the middle, like a donut. Recommended if you want not only the graph but also the text to stand out."},inputs:{colors:[{legend:{ja:"グラフの色",en:"Graph color"},defaultValue:a.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:a.COLOR.SILVER}],ranges:[{legend:{ja:"割合",en:"rate"},defaultValue:60,min:0,max:100,step:.1,unit:{ja:"%",en:"%"}}]},codeFunc:({colors:e,ranges:t})=>({html:'<div class="pie-chart-2">円グラフの例</div>',css:`.pie-chart-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 200px;
    margin: 0 auto;
    border-radius: 50%;
    background-image: radial-gradient(#fff 55%, transparent 55%), conic-gradient(${e[0]} ${t[0]}%, ${e[1]} ${t[0]}% 100%);
    font-weight: 600;
}`})};
    return function(params){ return l.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['radio-1'] = (function(a){
    const d = {id:1,name:{ja:"スタンダード",en:"Standard"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.SILVER}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"円",en:"Circle"},value:a.BORDER_RADIUS.HALF},{label:{ja:"四角",en:"Square"},value:a.BORDER_RADIUS["3PX"]}]},{legend:{ja:"チェック時のアニメーション",en:"Animation when checking"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:o,radios:e})=>({html:`<fieldset class="radio-1">
    <label>
        <input type="radio" name="radio-1" checked/>
        radio1
    </label>
    <label>
        <input type="radio" name="radio-1"/>
        radio2
    </label>
    <label>
        <input type="radio" name="radio-1"/>
        radio3
    </label>
</fieldset>`,css:`.radio-1 {
    display: flex;
    flex-wrap: wrap;
    gap: .3em 2em;
    border: none;
}

.radio-1 label {
    display: flex;
    align-items: center;
    gap: 0 .5em;
    position: relative;
    cursor: pointer;
}

.radio-1 label::before,
.radio-1 label:has(:checked)::after {
    border-radius: ${e[0]};
    content: '';
}

.radio-1 label::before {
    width: 18px;
    height: 18px;
    background-color: #e6edf3;
}

.radio-1 label:has(:checked)::after {
    position: absolute;
    top: 50%;
    left: 9px;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background-color: ${o[0]};${e[1]?`
    animation: anim-radio-1 .3s linear;`:""}
}${e[1]?`

@keyframes anim-radio-1 {
    0% {
        box-shadow: 0 0 0 1px transparent;
    }
    50% {
        box-shadow: 0 0 0 10px ${o[0]}33;
    }
    100% {
        box-shadow: 0 0 0 10px transparent;
    }
}`:""}

.radio-1 input {
    display: none;
}`})};
    return function(params){ return d.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['radio-2'] = (function(a){
    const t = {id:2,name:{ja:"枠線あり",en:"With border"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.BLUE}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"円",en:"Circle"},value:a.BORDER_RADIUS.HALF},{label:{ja:"四角",en:"Square"},value:a.BORDER_RADIUS["3PX"]}]},{legend:{ja:"チェック時のアニメーション",en:"Animation when checking"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]}]},codeFunc:({colors:o,radios:e})=>({html:`<fieldset class="radio-2">
    <label>
        <input type="radio" name="radio-2" checked/>
        radio1
    </label>
    <label>
        <input type="radio" name="radio-2"/>
        radio2
    </label>
    <label>
        <input type="radio" name="radio-2"/>
        radio3
    </label>
</fieldset>`,css:`.radio-2 {
    display: flex;
    flex-wrap: wrap;
    gap: .3em 2em;
    border: none;
}

.radio-2 label {
    display: flex;
    align-items: center;
    gap: 0 .5em;
    position: relative;
    cursor: pointer;
}

.radio-2 label::before,
.radio-2 label::after {
    border-radius: ${e[0]};
    content: '';
}

.radio-2 label::before {
    width: 18px;
    height: 18px;
    border: 2px solid #dee5eb;
    box-sizing: border-box;
}

.radio-2 label::after {
    position: absolute;
    top: 50%;
    left: 9px;
    transform: translate(-50%, -50%);
    width: 9px;
    height: 9px;
    background-color: #dee5eb;
}

.radio-2 label:has(:checked)::after {
    background-color: ${o[0]};${e[1]?`
    animation: anim-radio-2 .3s linear;`:""}
}${e[1]?`

@keyframes anim-radio-2 {
    0% {
        box-shadow: 0 0 0 1px transparent;
    }
    50% {
        box-shadow: 0 0 0 10px ${o[0]}33;
    }
    100% {
        box-shadow: 0 0 0 10px transparent;
    }
}`:""}

.radio-2 input {
    display: none;
}`})};
    return function(params){ return t.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['radio-3'] = (function(a){
    const n = {id:3,name:{ja:"枠線 & 背景色",en:"Border & background color"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:a.COLOR.BLUE}],radios:[{legend:{ja:"形状",en:"Shape"},choices:[{label:{ja:"四角",en:"Square"},value:a.BORDER_RADIUS["3PX"]},{label:{ja:"角丸",en:"Rounded corners"},value:a.BORDER_RADIUS.ELLIPSE}]}]},codeFunc:({colors:e,radios:o})=>({html:`<fieldset class="radio-3">
    <label>
        <input type="radio" name="radio-3" checked/>
        radio1
    </label>
    <label>
        <input type="radio" name="radio-3"/>
        radio2
    </label>
    <label>
        <input type="radio" name="radio-3"/>
        radio3
    </label>
</fieldset>`,css:`.radio-3 {
    border: none;
}

.radio-3 label {
    display: flex;
    align-items: center;
    gap: 0 .5em;
    position: relative;
    max-width: 200px;
    margin-bottom: .4em;
    padding: .5em .7em;
    border: 1px solid ${e[0]};
    border-radius: ${o[0]};
    background-color: ${e[0]}26;
    cursor: pointer;
}

.radio-3 label:has(:checked) {
    background-color: ${e[0]};
    color: #fff;
}

.radio-3 label::before,
.radio-3 label:has(:checked)::after {
    border-radius: 50%;
    content: '';
}

.radio-3 label::before {
    width: 14px;
    height: 14px;
    background-color: #fff;
}

.radio-3 label:has(:checked)::after {
    position: absolute;
    top: 50%;
    left: calc(7px + .7em);
    transform: translate(-50%, -50%);
    width: 7px;
    height: 7px;
    background-color: ${e[0]};
}

.radio-3 input {
    display: none;
}`})};
    return function(params){ return n.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['toc-1'] = (function(a){
    const r = {id:1,name:{ja:"灰色背景 & 枠線",en:"Gray background & border"},comment:{ja:"とてもシンプルな、由緒正しきデザインの目次です。aタグのスタイルに手を加えないことによって、各見出しがクリック可であることが直感的に伝わりやすくなっています。",en:"This is a table of contents with a very simple and time-honored design. By not changing the style of the tag, it is easy to intuitively convey that each heading is clickable."},inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:"#f7f7f7"}],radios:[{legend:{ja:"開閉機能",en:"Opening/Closing function"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]},{legend:{ja:"タイトルのアイコン",en:"Title icon"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]},{legend:{ja:"マーカーの種類",en:"Marker type"},choices:[{label:{ja:"数字",en:"Decimal"},value:a.LIST_TYPE.decimal},{label:{ja:"点",en:"Disc"},value:a.LIST_TYPE.disc}]}]},codeFunc:({colors:l,radios:e})=>({html:`<div class="toc-001">
    <div>
        目次${e[0]?`
        <label><input type="checkbox"/></label>`:""}
    </div>
    <ol>
        <li><a href="#">見出し1</a></li>
        <li>
            <a href="#">見出し2</a>
            <ol>
                <li><a href="#">見出し2-1</a></li>
                <li><a href="#">見出し2-2</a></li>
            </ol>
        </li>
    </ol>
</div>`,css:`.toc-001 {
    margin-bottom: 30px;
    padding: 1em 1em 1em 2em;
    border: 1px solid #999;
    background-color: ${l[0]};
    color: ${a.COLOR.BLACK_TEXT};
}

.toc-001 div {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 5px 0;
}${e[1]?`

.toc-001 div::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 5px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 4H21V6H8V4ZM3 3.5H6V6.5H3V3.5ZM3 10.5H6V13.5H3V10.5ZM3 17.5H6V20.5H3V17.5ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z' fill='%23333'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}`:""}${e[0]?`

.toc-001 label::after {
    margin-left: 5px;
    font-size: .8em;
    color: #166c9d;
    content: "[開く]";
    cursor: pointer;
}

.toc-001:has(:checked) label::after {
    content: "[閉じる]";
}

.toc-001 input {
    display: none;
}`:""}

.toc-001 ol {
    list-style-type: ${e[2]};
    margin: 0;
    padding: 0 1.2em;
    overflow: hidden;
}${e[0]?`

.toc-001 > ol {
    height: 0;
}

.toc-001:has(:checked) > ol {
    height: auto;
}`:""}

.toc-001 ol ol {
    margin-top: 5px;
}

.toc-001 li {
    padding: 5px 0;
}

.toc-001 a {
    color: #166c9d;
}`})};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['toc-2'] = (function(o){
    const r = {id:2,name:{ja:"フラットデザイン & 枠線",en:"Flat design & border"},comment:{ja:"タイトルの背景と枠線の色を統一した、可愛らしい目次です。ぜひご自身のサイトのテーマカラーを基調色として設定してみてください。",en:"This is a cute table of contents with a unified title background and border color. Please try setting your own site's theme color as the base color."},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:o.COLOR.BLUE}],radios:[{legend:{ja:"開閉機能",en:"Opening/Closing function"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]},{legend:{ja:"タイトルのアイコン",en:"Title icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]},{legend:{ja:"マーカーの種類",en:"Marker type"},choices:[{label:{ja:"数字",en:"Decimal"},value:o.LIST_TYPE.decimal},{label:{ja:"点",en:"Disc"},value:o.LIST_TYPE.disc}]}]},codeFunc:({colors:t,radios:e})=>({html:`<div class="toc-002">
    <div>
        目次${e[0]?`
        <label><input type="checkbox"/></label>`:""}
    </div>
    <ol>
        <li><a href="#">見出し1</a></li>
        <li>
            <a href="#">見出し2</a>
            <ol>
                <li><a href="#">見出し2-1</a></li>
                <li><a href="#">見出し2-2</a></li>
            </ol>
        </li>
    </ol>
</div>`,css:`.toc-002 {
    margin-bottom: 30px;
    border: 2px solid ${t[0]};
    border-radius: 3px;
}

.toc-002 div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 10px 0;
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1.1em;
}${e[1]?`

.toc-002 div::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 5px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 4H21V6H8V4ZM3 3.5H6V6.5H3V3.5ZM3 10.5H6V13.5H3V10.5ZM3 17.5H6V20.5H3V17.5ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}`:""}${e[0]?`

.toc-002 label::after {
    margin-left: 7px;
    font-weight: 500;
    font-size: .7em;
    color: #fff;
    content: "[開く]";
    cursor: pointer;
}

.toc-002:has(:checked) label::after {
    content: "[閉じる]";
}

.toc-002 input {
    display: none;
}`:""}

.toc-002 ol {
    list-style-type: ${e[2]};
    margin: 0;
    overflow: hidden;
}${e[0]?`

.toc-002 > ol {
    height: 0;
}

.toc-002:has(:checked) > ol {
    height: auto;
    padding: 1em 1em 1em 3em;
}`:`

.toc-002 > ol {
    padding: 1em 1em 1em 3em;
}`}

.toc-002 ol ol {
    margin-top: 5px;
    padding-left: 1.1em;
}

.toc-002 li {
    padding: 5px 0;
    font-weight: 600;
}

.toc-002 ol ol li {
    font-weight: 500;
    font-size: .9em;
}

.toc-002 a {
    color: #333;
    text-decoration: none;
}`})};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['toc-5'] = (function(l){
    const r = {id:5,name:{ja:"フラットデザイン",en:"Flat design"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:l.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:l.COLOR.SILVER}],radios:[{legend:{ja:"開閉機能",en:"Opening/Closing function"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]},{legend:{ja:"タイトルのアイコン",en:"Title icon"},choices:[{label:{ja:"あり",en:"ON"},value:!0},{label:{ja:"なし",en:"OFF"},value:!1}]},{legend:{ja:"マーカーの種類",en:"Marker type"},choices:[{label:{ja:"数字",en:"Decimal"},value:l.LIST_TYPE.decimal},{label:{ja:"点",en:"Disc"},value:l.LIST_TYPE.disc}]}]},codeFunc:({colors:o,radios:e})=>({html:`<div class="toc-005">
    <div>
        目次${e[0]?`
        <label><input type="checkbox"/></label>`:""}
    </div>
    <ol>
        <li><a href="#">見出し1</a></li>
        <li>
            <a href="#">見出し2</a>
            <ol>
                <li><a href="#">見出し2-1</a></li>
                <li><a href="#">見出し2-2</a></li>
            </ol>
        </li>
    </ol>
</div>`,css:`.toc-005 {
    margin-bottom: 30px;
    border-radius: 3px;
    background-color: ${o[1]};
}

.toc-005 div {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 10px 0;
    background-color: ${o[0]};
    color: #fff;
    font-weight: 600;
    font-size: 1.1em;
}${e[1]?`

.toc-005 div::before {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 5px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 4H21V6H8V4ZM3 3.5H6V6.5H3V3.5ZM3 10.5H6V13.5H3V10.5ZM3 17.5H6V20.5H3V17.5ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    content: '';
}`:""}${e[0]?`

.toc-005 label::after {
    margin-left: 7px;
    font-weight: 500;
    font-size: .7em;
    color: #fff;
    content: "[開く]";
    cursor: pointer;
}

.toc-005:has(:checked) label::after {
    content: "[閉じる]";
}

.toc-005 input {
    display: none;
}`:""}

.toc-005 ol {
    list-style-type: ${e[2]};
    margin: 0;
    overflow: hidden;
}${e[0]?`

.toc-005 > ol {
    height: 0;
}

.toc-005:has(:checked) > ol {
    height: auto;
    padding: 1em 1em 1em 3em;
}`:`

.toc-005 > ol {
    padding: 1em 1em 1em 3em;
}`}

.toc-005 ol ol {
    margin-top: 5px;
    padding-left: 1.1em;
}

.toc-005 li {
    padding: 5px 0;
    font-weight: 600;
}

.toc-005 ol ol li {
    font-weight: 500;
    font-size: .9em;
}

.toc-005 a {
    color: #333;
    text-decoration: none;
}`})};
    return function(params){ return r.codeFunc(params); };
  })(_di_consts);
  root.designInserterPartCodeFuncs['bar-chart-1'] = (function(r, d, e){
    const s = {id:1,name:{ja:"スタンダード",en:"Standard"},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:r.COLOR.BLUE}],radios:[{legend:{ja:"アニメーション",en:"Animation"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]}],ranges:[{legend:{ja:"項目1の値",en:"Item 1 value"},defaultValue:60,min:0,max:100,step:.1,unit:{ja:"%",en:"%"}}]},codeFunc:({colors:i,radios:a,ranges:t})=>({html:`<dl class="bar-chart-1">
    <div>
        <dt>項目1</dt>
        <dd style="width: ${t[0]}%">${t[0]}%</dd>
    </div>
    <div>
        <dt>項目2</dt>
        <dd style="width: ${d(t[0])}%">${d(t[0])}%</dd>
    </div>
    <div>
        <dt>項目3</dt>
        <dd style="width: ${e(t[0])}%">${e(t[0])}%</dd>
    </div>
</dl>`,css:`.bar-chart-1 {
    font-size: .9em;
}

.bar-chart-1 > div {
    display: flex;
    align-items: center;
    margin-bottom: 7px;
}

.bar-chart-1 dt {
    width: 55px;
    min-width: 55px;
}

.bar-chart-1 dd {
    margin: 0;
    padding-right: 15px;
    border-radius: 3px;
    background-color: ${i[0]};
    color: #fff;
    font-weight: 600;
    line-height: 45px;
    text-align: right;
    white-space: nowrap;${a[0]?`
    animation: anima-bar-chart-1 1.2s ease;`:""}
}${a[0]?`

@keyframes anima-bar-chart-1 {
    from {
        width: 0;
    }
}`:""}`})};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts, _di_functions_bar_chart.get2ndText, _di_functions_bar_chart.get3rdText);
  root.designInserterPartCodeFuncs['bar-chart-2'] = (function(e, i, r){
    const h = {id:2,name:{ja:"背景色あり",en:"With background color"},inputs:{colors:[{legend:{ja:"バーの色",en:"Bar color"},defaultValue:e.COLOR.BLUE},{legend:{ja:"背景色",en:"Background color"},defaultValue:e.COLOR.SILVER}],radios:[{legend:{ja:"アニメーション",en:"Animation"},choices:[{label:{ja:"なし",en:"OFF"},value:!1},{label:{ja:"あり",en:"ON"},value:!0}]}],ranges:[{legend:{ja:"項目1の値",en:"Item 1 value"},defaultValue:60,min:0,max:100,step:.1,unit:{ja:"%",en:"%"}}]},codeFunc:({colors:t,radios:d,ranges:a})=>({html:`<dl class="bar-chart-002">
    <div>
        <dt>項目1</dt>
        <dd><span style="width: ${a[0]}%">${a[0]}%</span></dd>
    </div>
    <div>
        <dt>項目2</dt>
        <dd><span style="width: ${i(a[0])}%">${i(a[0])}%</span></dd>
    </div>
    <div>
        <dt>項目3</dt>
        <dd><span style="width: ${r(a[0])}%">${r(a[0])}%</span></dd>
    </div>
</dl>`,css:`.bar-chart-002 {
    font-size: .9em;
}

.bar-chart-002 > div {
    display: flex;
    align-items: center;
    margin-bottom: 7px;
}

.bar-chart-002 dt {
    width: 55px;
    min-width: 55px;
}

.bar-chart-002 dd {
    width: 100%;
    margin: 0;
    border-radius: 3px;
    background-color: ${t[1]};
}

.bar-chart-002 span {
    display: inline-block;
    padding-right: 15px;
    border-radius: inherit;
    background-color: ${t[0]};
    color: #fff;
    font-weight: 600;
    line-height: 45px;
    text-align: right;
    white-space: nowrap;${d[0]?`
    animation: anima-bar-chart-002 1.2s ease;`:""}
}${d[0]?`

@keyframes anima-bar-chart-002 {
    from {
        width: 0;
    }
}`:""}`})};
    return function(params){ return h.codeFunc(params); };
  })(_di_consts, _di_functions_bar_chart.get2ndText, _di_functions_bar_chart.get3rdText);
  root.designInserterPartCodeFuncs['modal-1'] = (function(l, a){
    const r = {id:1,name:{ja:"リンク風",en:"Link style"},imgFormat:"gif",inputs:{colors:[{legend:{ja:"リンクの色",en:"Link color"},defaultValue:a.COLOR.BLUE_LINK},{legend:{ja:"ホバー時の色",en:"Color on hover"},defaultValue:a.COLOR.ORANGE_LINK_HOVER}]},codeFunc:({colors:o})=>({html:`<div class="modal-1__wrap">
  <input type="radio" id="modal-1__open" class="modal-1__open-input" name="modal-1__trigger"/>
  <label for="modal-1__open"  class="modal-1__open-label">モーダルを開く</label>
  <input type="radio" id="modal-1__close" name="modal-1__trigger"/>
  <div class="modal-1">
    <div class="modal-1__content-wrap">
      <label for="modal-1__close" class="modal-1__close-label">×</label>
      <div class="modal-1__content">${l.MODAL_CONTENT}</div>
    </div>
    <label for="modal-1__close">
      <div class="modal-1__background"></div>
    </label>
  </div>
</div>`,css:`.modal-1__wrap {
    display: inline-block;
}

.modal-1__wrap input {
    display: none;
}

.modal-1__open-label,
.modal-1__close-label {
    cursor: pointer;
}

.modal-1__open-label {
    color: ${o[0]};
    font-size: .95em;
}

.modal-1__open-label:hover {
    text-decoration: underline;
    cursor: pointer;
    color: ${o[1]};
}

.modal-1 {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: none;
}

.modal-1__open-input:checked + label + input + .modal-1 {
    display: block;
    animation: modal-1-animation .6s;
}

.modal-1__content-wrap {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 650px;
    background-color: #fefefe;
    z-index: 2;
    border-radius: 5px;
}

.modal-1__close-label {
    background-color: #777;
    color: #fff;
    border: 2px solid #fff;
    border-radius: 20px;
    width: 36px;
    height: 36px;
    line-height: 1.5;
    text-align: center;
    display: table-cell;
    position: fixed;
    top: -15px;
    right: -2%;
    z-index: 99999;
    font-size: 1.4em;
}

.modal-1__content {
    max-height: 50vh;
    overflow-y: auto;
    padding: 39px 45px 40px;
}

.modal-1__background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .45);
    z-index: 1;
}

@keyframes modal-1-animation {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@media only screen and (max-width: 520px) {
    .modal-1__open-label {
        max-width: 90%;
        padding: .94em 2.1em .94em 2.6em;
    }

    .modal-1__close-label {
        top: -17px;
        right: -4%;
    }

    .modal-1__content-wrap {
        width: 90vw;
    }

    .modal-1__content {
        padding: 33px 21px 35px;
        max-width: 100%;
    }
}`})};
    return function(params){ return r.codeFunc(params); };
  })(_di_common_modal.COMMON, _di_consts);
  root.designInserterPartCodeFuncs['modal-2'] = (function(a, e){
    const p = {id:2,name:{ja:"ボタン風",en:"Button style"},imgFormat:"gif",inputs:{colors:[{legend:{ja:"背景色",en:"Background color"},defaultValue:"#2589d0"},{legend:{ja:"文字色",en:"Text color"},defaultValue:a.COLOR.WHITE}]},codeFunc:({colors:o})=>({html:`<div class="modal-2__wrap">
    <input type="radio" id="modal-2__open" class="modal-2__open-input" name="modal-2__trigger"/>
    <label for="modal-2__open" class="modal-2__open-label">モーダルを開く</label>
    <input type="radio" id="modal-2__close" name="modal-2__trigger"/>
    <div class="modal-2">
        <div class="modal-2__content-wrap">
            <label for="modal-2__close" class="modal-2__close-label">×</label>
            <div class="modal-2__content">${e.MODAL_CONTENT}</div>
        </div>
        <label for="modal-2__close">
            <div class="modal-2__background"></div>
        </label>
    </div>
</div>`,css:`.modal-2__wrap input {
    display: none;
}

.modal-2__open-label,
.modal-2__close-label {
    cursor: pointer;
}

.modal-2__open-label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin:0 auto;
    padding: .8em 2em;
    border: none;
    border-radius: 5px;
    background-color: ${o[0]};
    color: ${o[1]};
    font-weight: 600;
    font-size: 1em;
}

.modal-2__open-label:hover {
    background-color: #fff;
    color: ${o[0]};
    outline: 1px solid ${o[0]};
}

.modal-2 {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: none;
}

.modal-2__open-input:checked + label + input + .modal-2 {
    display: block;
    animation: modal-2-animation .6s;
}

.modal-2__content-wrap {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 650px;
    background-color: #fefefe;
    z-index: 2;
    border-radius: 5px;
}

.modal-2__close-label {
    background-color: #777;
    color: #fff;
    border: 2px solid #fff;
    border-radius: 20px;
    width: 36px;
    height: 36px;
    line-height: 1.6;
    text-align: center;
    display: table-cell;
    position: fixed;
    top: -15px;
    right: -2%;
    z-index: 99999;
    font-size: 1.3em;
}

.modal-2__content {
    max-height: 50vh;
    overflow-y: auto;
    padding: 39px 45px 40px;
}

.modal-2__background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .45);
    z-index: 1;
}

@keyframes modal-2-animation {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@media only screen and (max-width: 520px) {
    .modal-2__open-label {
        max-width: 90%;
        padding: .94em 2.1em .94em 2.6em;
    }

    .modal-2__close-label {
        top: -17px;
        right: -4%;
    }

    .modal-2__content-wrap {
        width: 90vw;
    }

    .modal-2__content {
        padding: 33px 21px 35px;
        max-width: 100%;
    }
}`})};
    return function(params){ return p.codeFunc(params); };
  })(_di_consts, _di_common_modal.COMMON);
  root.designInserterPartCodeFuncs['timeline-3'] = (function(i){
    const s = {id:3,name:{ja:"ステップバー",en:"Step bar"},comment:{ja:"当サイトでも使用している、ナビゲーションとして設置するのに適したタイムライン。ユーザー登録や商品購入などのフローを分かりやすく可視化することができます。ちなみにアクティブ化するには、現在のステップの項目に「current」クラスを、それ以前の項目に「prev」を付けてあげる必要があります。",en:'A timeline suitable for setting up as a navigation, which is also used on this site. You can easily visualize the flow of user registration, product purchase, etc. By the way, to activate it, you need to add "current" class to the item of the current step and "prev" to the previous item.'},inputs:{colors:[{legend:{ja:"基調色",en:"Base color"},defaultValue:i.COLOR.BLUE}]},codeFunc:({colors:e})=>({html:`<ol class="timeline-003">
    <li class="prev">step1</li>
    <li class="prev">step2</li>
    <li class="current">step3</li>
    <li>step4</li>
    <li>step5</li>
</ol>`,css:`.timeline-003 {
    display: flex;
    justify-content: center;
    list-style-type: none;
    padding: 0;
}

.timeline-003 li {
    display: flex;
    flex: 1 1;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
    color: #969da3;
    font-size: .8em;
}

.timeline-003 li.prev,
.timeline-003 li.current {
    color: ${e[0]};
}

.timeline-003 li::before {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-bottom: 6px;
    content: '';
    border: 2px solid #d6dde3;
    border-radius: 50%;
    background-color: #fff;
}

.timeline-003 li.prev::before,
.timeline-003 li.current::before {
    border-color: ${e[0]};
}

.timeline-003 li:not(:last-child)::after {
    position: absolute;
    top: 8px;
    left: 50%;
    z-index: -1;
    width: 100%;
    height: 2px;
    background-color: #d6dde3;
    content: '';
}

.timeline-003 li.current::before,
.timeline-003 li.prev::after {
    background-color: ${e[0]};
}`})};
    return function(params){ return s.codeFunc(params); };
  })(_di_consts);
})(window);