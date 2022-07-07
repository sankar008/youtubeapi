const puppeteer = require("puppeteer");
const { jsPDF } = require("jspdf");

const youtubeModel = require("./youtube.service");

const createPdf = async (req, res) => {
  const body = req.body;
  const youtubeURL = body.link;

  const captureData = [];
  let start = new Date();
  let figWidth;
  let figHeight;
  try {
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(`${youtubeURL}&t=5`, {
      waitUntil: "networkidle2",
    });

    // get video component
    await page.waitForSelector(".html5-main-video");
    const videoEle = await page.$(".html5-main-video");

    // get video size
    figWidth = await page.evaluate((video) => {
      // 여기 내부에서 실행되는건 브라우저상에서 실행되는거라, node 상으로 반영 안된다.
      return video.videoWidth;
    }, videoEle);

    figHeight = await page.evaluate((video) => {
      return video.videoHeight;
    }, videoEle);

    if ((await page.$(".paused-mode")) !== null) {
      await page.keyboard.press("k");
      await page.waitForTimeout(200);
    }

    // ad skip
    try {
      while ((await page.$(".ad-showing")) !== null) {
        await page.waitForSelector(".buffering-mode", { hidden: true });
        if ((await page.$(".paused-mode")) !== null) {
          await page.keyboard.press("k");
        }
        await page.waitForTimeout(6000);
        if ((await page.$(".ytp-ad-skip-button")) !== null) {
          const skipButton = await page.$(".ytp-ad-skip-button");
          await skipButton.click();
        }
      }
    } catch (e) {
      console.log("광고 스킵하는 부분에서 에러발생");
    }

    // get video length
    const timeEle = await page.$(".ytp-bound-time-right");
    const lenText = await timeEle.evaluate((ele) => {
      return ele.innerHTML;
    }, timeEle);
    const lenArray = lenText.split(":");
    let videoLength;
    if (lenArray[0] === "0") {
      console.log("too short!");
      console.log(lenArray);
    } else if (lenArray.length == 2) {
      console.log("under 1 hour video");
      videoLength = parseInt(lenArray[0], 10);
    } else if (lenArray.length == 3) {
      console.log("over 1 hour video");
      videoLength = parseInt(lenArray[0], 10) * 60 + parseInt(lenArray[1], 10);
    } else {
      console.log("exeptional case");
    }

    // caption on
    const captionBtn = await page.$(".ytp-subtitles-button");
    const captionOn = await page.evaluate(
      (el) => el.getAttribute("aria-pressed"),
      captionBtn
    );
    if (captionOn == "false") {
      await captionBtn.click();
    }

    // start screenshot
    for (let i = 0; i < videoLength + 1; i++) {
      await page.waitForSelector(".buffering-mode", { hidden: true });

      try {
        await page.waitForFunction(
          `document.querySelector('.ytp-spinner') && document.querySelector('.ytp-spinner').style.display=='none'`
        );
      } catch (e) {
        console.log("스피너 대기하는곳에서 에러발생");
      }

      // ad skip
      try {
        while ((await page.$(".ad-showing")) !== null) {
          await page.waitForSelector(".buffering-mode", { hidden: true });
          if ((await page.$(".paused-mode")) !== null) {
            await page.keyboard.press("k");
          }
          await page.waitForTimeout(6000);
          if ((await page.$(".ytp-ad-skip-button")) !== null) {
            const skipButton = await page.$(".ytp-ad-skip-button");
            await skipButton.click();
          }
        }
      } catch (e) {
        console.log("광고 스킵하는 부분에서 에러발생");
      }

      await page.waitForSelector(".buffering-mode", { hidden: true });

      // close overlay ad
      try {
        if ((await page.$(".ytp-ad-overlay-close-button")) !== null) {
          const adCloseBtns = await page.$$(".ytp-ad-overlay-close-button");
          await adCloseBtns[adCloseBtns.length - 1].click();
        }
      } catch (e) {
        console.log("오버레이 광고 끄는 부분에서 에러 발생");
      }

      try {
        if ((await page.$(".playing-mode")) !== null) {
          await page.keyboard.press("k");
          await page.waitForTimeout(200);
        }
      } catch (e) {
        console.log("플레잉 모드인거 재생멈춤 하는데서 에러발생");
      }

      await page.waitForSelector(".buffering-mode", { hidden: true });

      // take screenshot
      // there are two options.
      // 1. no auto-generated caption. slightly fast and light weight. It is default.
      // 2. with auto-generated caption. It is not clear; it contains some youtube underbars.

      // opt 1
      //captureData.push(
      //  await page.evaluate((video) => {
      //    var scale = 1;
      //    var canvas = document.createElement("canvas");
      //    canvas.width = video.videoWidth * scale;
      //    canvas.height = video.videoHeight * scale;
      //    figWidth = video.videoWidth * scale;
      //    figHeight = video.videoHeight * scale;
      //    canvas
      //      .getContext("2d")
      //      .drawImage(video, 0, 0, canvas.width, canvas.height);
      //    return canvas.toDataURL("image/jpeg", 0.8);
      //  }, videoEle)
      //);

      // opt 2
      captureData.push(
        await videoEle.screenshot({
          type: "jpeg",
          encoding: "base64",
        })
      );

      // if you want to single screenshots, use .screenshot method.
      //await videoEle.screenshot({
      //  //path: `results/${i}_${Date.now()}.jpeg`,
      //  type: "jpeg",
      // encoding: "base64"
      //});

      // move to next time
      await page.keyboard.press("l");
      await page.keyboard.press("l");
      await page.keyboard.press("l");
      await page.keyboard.press("l");
      await page.keyboard.press("l");
      await page.keyboard.press("l");
      await page.waitForTimeout(100);
      await page.waitForSelector(".buffering-mode", { hidden: true });
      try {
        await page.waitForFunction(
          `document.querySelector('.ytp-spinner') && document.querySelector('.ytp-spinner').style.display=='none'`
        );
      } catch (e) {
        console.log("맨 마지막 스피너 기다리는데서 에러발생");
      }
      try {
        await page.waitForFunction(
          `document.querySelector('.ytp-bezel-text-hide') && document.querySelector('.ytp-bezel-text-hide').style.display=='none'`
        );
      } catch (e) {
        console.log("맨 마지막 화살표 없어지는거 기다리는데서 에러발생");
      }
    }

    await browser.close();

    // make pdf file
    const doc = new jsPDF("l", "pt", [figWidth, figHeight]);
    for (let i = 0; i < captureData.length; i++) {
      doc.addImage(captureData[i], "JPEG", 0, 0, figWidth, figHeight); //이미지 그리기
      if (i == captureData.length - 1) {
      } else {
        doc.addPage();
      }
    }

    // save it locally
    const pdfName = `./pdf.webdevelopments.in/upload/glancer-${Date.now()}.pdf`;
    const dbpdfName = `/upload/glancer-${Date.now()}.pdf`;

    doc.save(pdfName);

    // save it in s3
    // s3 upload functions except buffer or string, not arraybuffer.
    // jspdf supports arraybuffer output. but not buffet.
    // so I use Buffer.from(arraybuffer). It convert arraybuffer to buffer.

    //const output = Buffer.from(doc.output("arraybuffer"));
    //await s3
    //  .putObject({
    //    Bucket: bucketName,
    //    Key: `glancer-${Date.now()}.pdf`,
    //    Body: output,
    //    ContentType: "application/pdf",
    //  })
    //  .promise();
    //const uniqKey = `glancer-${Date.now()}.pdf`;
    //await s3
    //  .upload(
    //    {
    //      Bucket: bucketName,
    //      Key: uniqKey,
    //      Body: output,
    //    },
    //    function (err, data) {
    //      if (err) {
    //        return console.log(
    //          "There was an error uploading your pdf: ",
    //          err.message
    //        );
    //      }
    //    }
    //  )
    //  .promise();
    //const fileURL = s3.getSignedUrl(
    //  "getObject",
    //  {
    //    Bucket: bucketName,
    //    Key: uniqKey,
    //  },
    //  (err, url) => {
    //    if (err) {
    //      throw err;
    //    }
    //    console.log(url);
    //  }
    //);

    let end = new Date();
    console.log("소요시간(ms): ", end - start);

    const youtube = new youtubeModel({
        userId: body.userId,
        link: body.link,
        title: body.title,
        image: dbpdfName
    })

    const result = await youtube .save();
    return res.status(200).json({
        success: 1,
        data: result
    })


    return;
  } catch (e) {
    console.log(e);
  }

}

const getPdf = async (req, res) => {
    
    const userId = req.params.id;

    try{
        const data = await youtubeModel.find({userId:req.params.id})
        return res.status(200).json({
            success: 1,
            data: data
        })
    }
    catch(errors){
        return res.status(400).send(errors);
    }

}

const deletePdf = (req, res) => {
    
}

module.exports = {
    createPdf: createPdf,
    getPdf: getPdf,
    deletePdf: deletePdf
}
