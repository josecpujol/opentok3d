FILES=(glMatrix-0.9.5.min.js 3dLayout.js camera.js scene.js)
OUTPUTFILE="myLibrary.js"
rm $OUTPUTFILE
echo "Output file: "$OUTPUTFILE
for i in "${FILES[@]}"; do
  echo "Dumping "$i
  
  echo " // FILE "$i >> $OUTPUTFILE
  cat $i >> $OUTPUTFILE
done
