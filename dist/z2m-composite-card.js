/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let r=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}};const o=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:a,defineProperty:n,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:d,getPrototypeOf:h}=Object,u=globalThis,p=u.trustedTypes,f=p?p.emptyScript:"",m=u.reactiveElementPolyfillSupport,_=(t,e)=>t,g={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!a(t,e),$={attribute:!0,type:String,converter:g,reflect:!1,useDefault:!1,hasChanged:y};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&n(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=h(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...c(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:g).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:g;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??y)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[_("elementProperties")]=new Map,b[_("finalized")]=new Map,m?.({ReactiveElement:b}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const v=globalThis,A=t=>t,x=v.trustedTypes,E=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+w,T=`<${C}>`,O=document,P=()=>O.createComment(""),k=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,M="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,V=/>/g,H=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,R=/"/g,z=/^(?:script|style|textarea|title)$/i,L=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),Q=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),I=new WeakMap,q=O.createTreeWalker(O,129);function B(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const F=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",a=U;for(let e=0;e<i;e++){const i=t[e];let n,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===U?"!--"===l[1]?a=N:void 0!==l[1]?a=V:void 0!==l[2]?(z.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=H):void 0!==l[3]&&(a=H):a===H?">"===l[0]?(a=r??U,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?H:'"'===l[3]?R:j):a===R||a===j?a=H:a===N||a===V?a=U:(a=H,r=void 0);const h=a===H&&t[e+1].startsWith("/>")?" ":"";o+=a===U?i+T:c>=0?(s.push(n),i.slice(0,c)+S+i.slice(c)+w+h):i+w+(-2===c?e:h)}return[B(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class W{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const a=t.length-1,n=this.parts,[l,c]=F(t,e);if(this.el=W.createElement(l,i),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=q.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=c[o++],i=s.getAttribute(t).split(w),a=/([.?@])?(.*)/.exec(e);n.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?Y:"?"===a[1]?tt:"@"===a[1]?et:X}),s.removeAttribute(t)}else t.startsWith(w)&&(n.push({type:6,index:r}),s.removeAttribute(t));if(z.test(s.tagName)){const t=s.textContent.split(w),e=t.length-1;if(e>0){s.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],P()),q.nextNode(),n.push({type:2,index:++r});s.append(t[e],P())}}}else if(8===s.nodeType)if(s.data===C)n.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(w,t+1));)n.push({type:7,index:r}),t+=w.length-1}r++}}static createElement(t,e){const i=O.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,s){if(e===Q)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=k(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=J(t,r._$AS(t,e.values),r,s)),e}class K{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??O).importNode(e,!0);q.currentNode=s;let r=q.nextNode(),o=0,a=0,n=i[0];for(;void 0!==n;){if(o===n.index){let e;2===n.type?e=new G(r,r.nextSibling,this,t):1===n.type?e=new n.ctor(r,n.name,n.strings,this,t):6===n.type&&(e=new it(r,this,t)),this._$AV.push(e),n=i[++a]}o!==n?.index&&(r=q.nextNode(),o++)}return q.currentNode=O,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class G{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),k(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==Q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&k(this._$AH)?this._$AA.nextSibling.data=t:this.T(O.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=W.createElement(B(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new K(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=I.get(t.strings);return void 0===e&&I.set(t.strings,e=new W(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new G(this.O(P()),this.O(P()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=J(this,t,e,0),o=!k(t)||t!==this._$AH&&t!==Q,o&&(this._$AH=t);else{const s=t;let a,n;for(t=r[0],a=0;a<r.length-1;a++)n=J(this,s[i+a],e,a),n===Q&&(n=this._$AH[a]),o||=!k(n)||n!==this._$AH[a],n===Z?t=Z:t!==Z&&(t+=(n??"")+r[a+1]),this._$AH[a]=n}o&&!s&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Y extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class tt extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class et extends X{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??Z)===Q)return;const i=this._$AH,s=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==Z&&(i===Z||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const st=v.litHtmlPolyfillSupport;st?.(W,G),(v.litHtmlVersions??=[]).push("3.3.3");const rt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ot extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new G(e.insertBefore(P(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Q}}ot._$litElement$=!0,ot.finalized=!0,rt.litElementHydrateSupport?.({LitElement:ot});const at=rt.litElementPolyfillSupport;at?.({LitElement:ot}),(rt.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const nt=t=>t??Z;function lt(t){return"object"==typeof t&&null!==t&&!Array.isArray(t)}function ct(t){return t.property??t.name??"value"}function dt(t){return t instanceof Error?t.message:String(t)}function ht(t){if(!lt(t)||"string"!=typeof t.type)return null;const e=t.type;return["numeric","enum","binary","text","composite","list"].includes(e)?{name:"string"==typeof t.name?t.name:void 0,property:"string"==typeof t.property?t.property:void 0,label:"string"==typeof t.label?t.label:void 0,type:e,access:"number"==typeof t.access?t.access:void 0,description:"string"==typeof t.description?t.description:void 0,unit:"string"==typeof t.unit?t.unit:void 0,value_min:"number"==typeof t.value_min?t.value_min:void 0,value_max:"number"==typeof t.value_max?t.value_max:void 0,value_step:"number"==typeof t.value_step?t.value_step:void 0,default:t.default,values:Array.isArray(t.values)?t.values.filter(t=>"string"==typeof t):void 0,value_on:t.value_on,value_off:t.value_off,features:Array.isArray(t.features)?t.features.map(ht).filter(t=>null!==t):void 0}:null}class ut extends ot{constructor(){super(...arguments),this._dialogOpen=!1,this._draft=null,this._dialogError="",this._saving=!1}setConfig(t){if(!t||!t.entity)throw new Error("z2m-composite-card requires an entity in its configuration.");this._config={type:"custom:z2m-composite-card",entity:t.entity,title:t.title}}getCardSize(){return 3}static getStubConfig(){return{type:"custom:z2m-composite-card",entity:"sensor.example_composite"}}updated(t){if(t.has("hass")&&this._dialogOpen&&null===this._draft){const t=this._readContext();t.ok&&(this._draft=this._buildDraftObject(t.schema.features,t.currentValue??{}))}}render(){const t=this._readContext();if(!t.ok)return L`
        <ha-card>
          <div class="header">
            <h2 class="title">${t.title}</h2>
          </div>
          <p class="message">${t.message}</p>
          ${t.detail?L`<p class="message">${t.detail}</p>`:Z}
        </ha-card>
      `;const e=this._config?.title??t.schema.label??t.attribute.property;return L`
      <ha-card>
        <div class="header">
          <h2 class="title">${e}</h2>
          <button type="button" class="primary" @click=${()=>this._openDialog(t)}>Edit</button>
        </div>
        <div class="message">
          ${t.currentValue?"Current composite values published by Zigbee2MQTT.":"No current composite value is available yet; the editor will start from schema defaults."}
        </div>
        ${this._renderSummary(t.schema.features,t.currentValue??{})}
      </ha-card>
      ${this._renderDialog(t,e)}
    `}_readContext(){if(!this._config)return{ok:!1,title:"Zigbee2MQTT Composite Card",message:"Card configuration has not been set."};if(!this.hass)return{ok:!1,title:this._config.title??"Zigbee2MQTT Composite Card",message:"Waiting for Home Assistant to become available."};const t=this.hass.states[this._config.entity];if(!t||"unavailable"===t.state)return{ok:!1,title:this._config.title??"Zigbee2MQTT Composite Card",message:"This card requires an available Zigbee2MQTT composite sensor entity.",detail:`Entity ${this._config.entity} is unavailable or does not exist.`};const e=t.attributes.z2m_composite;if(!lt(e))return{ok:!1,title:this._config.title??"Zigbee2MQTT Composite Card",message:"This card requires a Zigbee2MQTT composite sensor entity.",detail:`Entity ${this._config.entity} does not have a z2m_composite attribute.`};if("string"!=typeof e.property||"string"!=typeof e.set_topic||"string"!=typeof e.schema_b64)return{ok:!1,title:this._config.title??"Zigbee2MQTT Composite Card",message:"The z2m_composite attribute is missing required property, set_topic, or schema_b64 fields."};let i=null;try{i=function(t){if(!lt(t)||"string"!=typeof t.property||!Array.isArray(t.features))return null;const e=t.features.map(ht).filter(t=>null!==t);return e.length!==t.features.length?null:{property:t.property,label:"string"==typeof t.label?t.label:void 0,features:e}}(function(t){const e=atob(t),i=Uint8Array.from(e,t=>t.charCodeAt(0));return JSON.parse((new TextDecoder).decode(i))}(e.schema_b64))}catch(t){return{ok:!1,title:this._config.title??"Zigbee2MQTT Composite Card",message:"The z2m_composite schema could not be decoded.",detail:dt(t)}}return i?{ok:!0,entity:t,schema:i,attribute:{property:e.property,set_topic:e.set_topic,schema_b64:e.schema_b64,value:lt(e.value)?e.value:null},currentValue:lt(e.value)?e.value:null}:{ok:!1,title:this._config.title??"Zigbee2MQTT Composite Card",message:"The decoded Zigbee2MQTT composite schema is invalid."}}_openDialog(t){this._draft=this._buildDraftObject(t.schema.features,t.currentValue??{}),this._dialogError="",this._dialogOpen=!0}_closeDialog(){this._saving||(this._dialogOpen=!1,this._dialogError="",this._draft=null)}_renderDialog(t,e){if(!this._dialogOpen)return Z;const i=t.ok?L`
          <div class="dialog-body">
            <div class="message">
              Edit every field below. Saving publishes the complete composite object in one MQTT message.
            </div>
            ${this._dialogError?L`<div class="error" role="alert">${this._dialogError}</div>`:Z}
            <div class="fields">${this._renderFeatureList(t.schema.features,[])}</div>
            <div class="actions">
              <button type="button" @click=${this._closeDialog} ?disabled=${this._saving}>Cancel</button>
              <button type="button" class="primary" @click=${this._save} ?disabled=${this._saving}>
                ${this._saving?"Saving…":"Save"}
              </button>
            </div>
          </div>
        `:L`
          <div class="dialog-body">
            <div class="error" role="alert">${t.message}</div>
            <div class="actions">
              <button type="button" @click=${this._closeDialog}>Close</button>
            </div>
          </div>
        `;return customElements.get("ha-dialog")?L`
        <ha-dialog open .heading=${`Edit ${e}`} @closed=${this._closeDialog}>${i}</ha-dialog>
      `:L`
      <div class="modal-backdrop" @click=${this._closeDialog}>
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-label=${`Edit ${e}`}
          @click=${t=>t.stopPropagation()}
        >
          <h3>Edit ${e}</h3>
          ${i}
        </section>
      </div>
    `}_renderSummary(t,e){return 0===t.length?L`<div class="summary"><div class="message">This composite schema has no editable features.</div></div>`:L`
      <div class="summary">
        ${t.map(t=>{const i=ct(t),s=t.label??t.name??i;return L`
            <div class="summary-row">
              <div class="summary-label">${s}</div>
              <div class="summary-value">${this._formatSummaryValue(t,e[i])}</div>
            </div>
          `})}
      </div>
    `}_renderFeatureList(t,e){return t.map(t=>this._renderFeature(t,e))}_renderFeature(t,e){const i=ct(t),s=[...e,i],r=t.label??t.name??i,o=t.description,a=this._getDraftValue(s),n=!this._isSettable(t)||this._saving;if("composite"===t.type)return L`
        <fieldset>
          <legend>${r}</legend>
          ${o?L`<div class="description">${o}</div>`:Z}
          ${this._renderFeatureList(t.features??[],s)}
        </fieldset>
      `;if("list"===t.type){const e=[...s,0];return L`
        <fieldset>
          <legend>${r}</legend>
          ${o?L`<div class="description">${o}</div>`:Z}
          <div class="help">List editing is limited to the first item.</div>
          ${this._renderFeatureList(t.features??[],e)}
        </fieldset>
      `}const l=this._renderControl(t,s,a,n);return L`
      <label class="field">
        <span class="field-label">${r}</span>
        ${l} ${o?L`<span class="description">${o}</span>`:Z}
        ${this._isSettable(t)?Z:L`<span class="help">Read-only in schema; current/default value will still be included.</span>`}
      </label>
    `}_renderControl(t,e,i,s){switch(t.type){case"numeric":return L`
          <span class="field-control">
            <input
              type="number"
              .value=${null==i?"":String(i)}
              min=${nt(t.value_min)}
              max=${nt(t.value_max)}
              step=${nt(t.value_step)}
              ?disabled=${s}
              @input=${i=>this._setDraftValue(e,this._numberInputValue(i,t))}
            />
            ${t.unit?L`<span class="unit">${t.unit}</span>`:Z}
          </span>
        `;case"enum":return L`
          <select
            .value=${String(i??t.values?.[0]??"")}
            ?disabled=${s}
            @change=${t=>this._setDraftValue(e,t.target.value)}
          >
            ${(t.values??[]).map(t=>L`<option value=${t}>${t}</option>`)}
          </select>
        `;case"binary":{const r=this._binaryOnValue(t),o=this._binaryOffValue(t),a=i===r;return L`
          <span class="field-control">
            <label class="switch">
              <input
                type="checkbox"
                .checked=${a}
                ?disabled=${s}
                @change=${t=>this._setDraftValue(e,t.target.checked?r:o)}
              />
              <span>${String(a?r:o)}</span>
            </label>
          </span>
        `}default:return L`
          <input
            type="text"
            .value=${String(i??"")}
            ?disabled=${s}
            @input=${t=>this._setDraftValue(e,t.target.value)}
          />
        `}}_numberInputValue(t,e){const i=t.target.value;if(""===i)return this._typeDefault(e);const s=Number(i);return Number.isFinite(s)?s:this._typeDefault(e)}async _save(){const t=this._readContext();if(t.ok)if(this.hass){this._saving=!0,this._dialogError="";try{const e=this._buildPayloadObject(t.schema.features,this._draft??{});await this.hass.callService("mqtt","publish",{topic:t.attribute.set_topic,payload:JSON.stringify({[t.attribute.property]:e})}),this._dialogOpen=!1,this._draft=null}catch(t){this._dialogError=`Failed to publish MQTT payload: ${dt(t)}`}finally{this._saving=!1}}else this._dialogError="Home Assistant is not available; cannot publish MQTT payload.";else this._dialogError=t.message}_buildDraftObject(t,e){const i={};for(const s of t){const t=ct(s);i[t]=this._draftValue(s,e[t])}return i}_draftValue(t,e){if(void 0!==e){if("composite"===t.type)return this._buildDraftObject(t.features??[],lt(e)?e:{});if("list"===t.type)return this._buildDraftList(t,e);if("numeric"===t.type){const i=Number(e);return Number.isFinite(i)?i:this._typeDefault(t)}if("text"===t.type||"enum"===t.type)return String(e);if("binary"===t.type)return e===this._binaryOnValue(t)?this._binaryOnValue(t):this._binaryOffValue(t)}return void 0!==t.default?"composite"===t.type?this._buildDraftObject(t.features??[],lt(t.default)?t.default:{}):"list"===t.type?this._buildDraftList(t,t.default):t.default:this._typeDefault(t)}_buildDraftList(t,e){const i=Array.isArray(e)?e:[],s=i[0];if(0===(t.features??[]).length)return i;return[this._buildDraftObject(t.features??[],lt(s)?s:{}),...i.slice(1)]}_typeDefault(t){switch(t.type){case"numeric":return t.value_min??0;case"enum":return t.values?.[0]??"";case"binary":return this._binaryOffValue(t);case"text":default:return"";case"composite":return this._buildDraftObject(t.features??[],{});case"list":return(t.features??[]).length>0?[this._buildDraftObject(t.features??[],{})]:[]}}_buildPayloadObject(t,e){const i={};for(const s of t){const t=ct(s);i[t]=this._payloadValue(s,e[t])}return i}_payloadValue(t,e){switch(t.type){case"numeric":{const i=Number(e);return Number.isFinite(i)?i:this._typeDefault(t)}case"enum":{const i=String(e??this._typeDefault(t));return t.values?.includes(i)?i:this._typeDefault(t)}case"binary":return e===this._binaryOnValue(t)?this._binaryOnValue(t):this._binaryOffValue(t);case"text":return String(e??"");case"composite":return this._buildPayloadObject(t.features??[],lt(e)?e:{});case"list":{const i=Array.isArray(e)?e:[];if(0===(t.features??[]).length)return i;return[this._buildPayloadObject(t.features??[],lt(i[0])?i[0]:{}),...i.slice(1)]}default:return""}}_binaryOnValue(t){return t.value_on??!0}_binaryOffValue(t){return t.value_off??!1}_isSettable(t){return void 0===t.access||!(2&~t.access)}_getDraftValue(t){let e=this._draft;for(const i of t)if(Array.isArray(e)&&"number"==typeof i)e=e[i];else{if(!lt(e)||"string"!=typeof i)return;e=e[i]}return e}_setDraftValue(t,e){this._draft||(this._draft={});let i=this._draft;for(let e=0;e<t.length-1;e+=1){const s=t[e],r="number"==typeof t[e+1]?[]:{};Array.isArray(i)&&"number"==typeof s?(lt(i[s])||Array.isArray(i[s])||(i[s]=r),i=i[s]):Array.isArray(i)||"string"!=typeof s||(lt(i[s])||Array.isArray(i[s])||(i[s]=r),i=i[s])}const s=t[t.length-1];Array.isArray(i)&&"number"==typeof s?i[s]=e:Array.isArray(i)||"string"!=typeof s||(i[s]=e),this.requestUpdate()}_formatSummaryValue(t,e){if(null==e)return"—";if("numeric"===t.type)return`${String(e)}${t.unit?` ${t.unit}`:""}`;if("object"==typeof e)try{return JSON.stringify(e)}catch(t){return String(e)}return String(e)}}ut.properties={hass:{attribute:!1},_config:{state:!0},_dialogOpen:{state:!0},_draft:{state:!0},_dialogError:{state:!0},_saving:{state:!0}},ut.styles=((t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(s,t,i)})`
    :host {
      display: block;
    }

    ha-card {
      display: block;
      overflow: hidden;
      padding: 16px;
    }

    h2,
    h3,
    h4 {
      margin: 0;
    }

    .header {
      align-items: center;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .title {
      font-size: 1.15rem;
      font-weight: 500;
      line-height: 1.3;
    }

    .summary {
      border-top: 1px solid var(--divider-color, #e0e0e0);
      display: grid;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
    }

    .summary-row {
      align-items: start;
      display: grid;
      gap: 8px;
      grid-template-columns: minmax(120px, 1fr) minmax(0, 2fr);
    }

    .summary-label,
    .field-label,
    legend {
      color: var(--primary-text-color, #212121);
      font-weight: 500;
    }

    .summary-value,
    .description,
    .help {
      color: var(--secondary-text-color, #727272);
    }

    .summary-value {
      overflow-wrap: anywhere;
    }

    .message {
      color: var(--secondary-text-color, #727272);
      line-height: 1.45;
    }

    .error {
      background: var(--error-color, #db4437);
      border-radius: 6px;
      color: var(--text-primary-color, #fff);
      margin: 12px 0;
      padding: 10px 12px;
    }

    button {
      background: transparent;
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 4px;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font: inherit;
      min-height: 36px;
      padding: 6px 14px;
    }

    button.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    button:disabled,
    input:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .dialog-body {
      display: grid;
      gap: 14px;
      min-width: min(560px, 78vw);
    }

    .fields {
      display: grid;
      gap: 12px;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    .field-control {
      align-items: center;
      display: flex;
      gap: 8px;
    }

    input[type='number'],
    input[type='text'],
    select {
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #d0d0d0);
      border-radius: 4px;
      color: var(--primary-text-color, #212121);
      font: inherit;
      min-height: 36px;
      min-width: 0;
      padding: 6px 8px;
      width: 100%;
    }

    .unit {
      color: var(--secondary-text-color, #727272);
      white-space: nowrap;
    }

    fieldset {
      border: 1px solid var(--divider-color, #d0d0d0);
      border-radius: 8px;
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 12px;
    }

    .switch {
      align-items: center;
      cursor: pointer;
      display: inline-flex;
      gap: 8px;
    }

    .switch input {
      height: 18px;
      width: 18px;
    }

    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .modal-backdrop {
      align-items: center;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      inset: 0;
      justify-content: center;
      padding: 16px;
      position: fixed;
      z-index: 1000;
    }

    .modal {
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      box-shadow: var(--ha-card-box-shadow, 0 8px 24px rgba(0, 0, 0, 0.3));
      box-sizing: border-box;
      color: var(--primary-text-color, #212121);
      max-height: calc(100vh - 48px);
      max-width: 680px;
      overflow: auto;
      padding: 20px;
      width: 100%;
    }

    .modal h3 {
      margin-bottom: 16px;
    }
  `,customElements.get("z2m-composite-card")||customElements.define("z2m-composite-card",ut),window.customCards=window.customCards??[],window.customCards.some(t=>"z2m-composite-card"===t.type)||window.customCards.push({type:"z2m-composite-card",name:"Zigbee2MQTT Composite Card",description:"Edit a Zigbee2MQTT composite expose and save it with one atomic MQTT write.",preview:!1});export{ut as Z2mCompositeCard};
