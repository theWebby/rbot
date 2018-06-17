// // var ocr = require('ocr');
// var path = require('path')
// var tesseract = require('node-tesseract');

// // // Set default values. 
// // var params = {
// //     input: './node_modules/ocr/samples/images/color.bmp',
// //     output: './out.txt',
// //     format: 'text'
// // };

// // // OCR the input image and output result to text file given by params.output
// // ocr.recognize(params, function(err, document) {
// //     if (err)
// //         console.error(err);
// //     else {
// //         //output the document object: 
// //         console.log(document);
// //     }
// // });

// var path = path.join(__dirname, '/../cm4.png')
// console.log(path)

// // Recognize text of any language in any format
// tesseract.process(path, function(err, text) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(text);
//     }
// });
// setTimeout(function() { alert("Hello"); }, 3000);
// console.log('continue')

function resolveAfter2Seconds() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, 2000);
    });
}

async function asyncCall() {
    console.log('calling');
    await resolveAfter2Seconds();
    console.log('after call')
        // console.log(result);
        // expected output: "resolved"
}

asyncCall();