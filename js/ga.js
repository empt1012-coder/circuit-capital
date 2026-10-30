window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-3XBX5B0EE6');

document.addEventListener('click', function (e) {
  var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
  if (!a) return;
  var href = a.getAttribute('href') || '';
  if (/^mailto:/i.test(href)) {
    gtag('event', 'order_click', { link_url: href, transport_type: 'beacon' });
  } else if (/beehiiv\.com\/products\//i.test(a.href)) {
    gtag('event', 'pack_click', { link_url: a.href, transport_type: 'beacon' });
  }
}, true);
