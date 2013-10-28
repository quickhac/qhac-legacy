window.Muscula = { settings:{
    logId:"3235c29f-3e0e-4991-b63f-512c44e2d4d5", suppressErrors: false, googleAnalyticsEvents: 'none', branding: 'none'
}};
(function () {
    var m = document.createElement('script'); m.type = 'text/javascript'; m.async = true;
    m.src = 'https://musculahq.appspot.com/Muscula2.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(m, s);
    window.Muscula.run=function(c){eval(c);window.Muscula.run=function(){};};
    window.Muscula.errors=[];window.onerror=function(){window.Muscula.errors.push(arguments);
    return window.Muscula.settings.suppressErrors===undefined;}
})();