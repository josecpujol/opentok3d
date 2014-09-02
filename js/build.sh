FILES=(glMatrix-0.9.5.min.js 3dLayout.js camera.js)
OUTPUTFILE="myLibrary.js"
rm $OUTPUTFILE
for i in "${FILES[@]}"; do
  echo $i
  
  echo " // FILE "$i >> $OUTPUTFILE
  cat $i >> $OUTPUTFILE
done
