// ==========================================================================
// Browser sniffing
// Unfortunately, due to mixed support, UA sniffing is required
// ==========================================================================
const browser = {
  isIE: /* @cc_on!@ */ false || !!document.DOCUMENT_NODE,
  isEdge: window.navigator.userAgent.includes('Edge'),
  isWebkit:
    'WebkitAppearance' in document.documentElement.style &&
    !/Edge/.test(navigator.userAgent),
  isIPhone: /(iPhone|iPod)/gi.test(navigator.platform),
  isIos: /(iPad|iPhone|iPod)/gi.test(navigator.platform),
  isAndroid: /(Android)/gi.test(navigator.userAgent),
  isWechat: /micromessenger/.test(navigator.userAgent.toLowerCase()),
}
export default browser
