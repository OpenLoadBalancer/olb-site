import { Html, Head, Main, NextScript } from "next/document";
const themeScript = `(function(){var p='system';try{p=localStorage.getItem('olb-theme')||p}catch(e){}if(!['light','dark','system'].includes(p))p='system';var m=matchMedia('(prefers-color-scheme: dark)');function apply(){document.documentElement.dataset.theme=p==='system'?(m.matches?'dark':'light'):p}document.documentElement.dataset.preference=p;apply();m.addEventListener('change',function(){if(document.documentElement.dataset.preference==='system'){p='system';apply()}});addEventListener('storage',function(e){if(e.key==='olb-theme'){p=['light','dark','system'].includes(e.newValue)?e.newValue:'system';document.documentElement.dataset.preference=p;apply()}})})();`;
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
