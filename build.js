// Optional: bundles css and js into one self-contained dist/index.html
const fs=require("fs");let h=fs.readFileSync("index.html","utf8");
h=h.replace(/<link rel="stylesheet" href="([^"]+)">/,(_,f)=>"<style>"+fs.readFileSync(f,"utf8")+"</style>");
h=h.replace(/<script src="([^"]+)"><\/script>/g,(_,f)=>"<script>"+fs.readFileSync(f,"utf8")+"</script>");
fs.mkdirSync("dist",{recursive:true});fs.writeFileSync("dist/index.html",h);console.log("dist/index.html",h.length,"bytes");
