dist=dist

echo "[build]"
npm run build 

echo "[prepare]"
mkdir -p $dist/vendor

echo "[copy files]"
cp -r app/index_dist.html $dist/index.html
cp -r bower_components/bootstrap $dist/vendor/
cp -r bower_components/angularjs-slider $dist/vendor/
cp -r bower_components/font-awesome $dist/vendor/
cp -r bower_components/html5-boilerplate $dist/vendor/
cp -r bower_components/requirejs $dist/vendor/
cp -r bower_components/marked $dist/vendor/
cp -r bower_components/kubernetes-container-terminal $dist/vendor/

echo "[remove unconcerned files]"
rm $dist/index_dist.html

echo "[end]"
