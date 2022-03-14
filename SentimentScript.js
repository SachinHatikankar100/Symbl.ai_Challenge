import fetch from "node-fetch";
import {Headers} from 'node-fetch';
var appId="6639324d6f634f56685a567858676142334d4b524b334a306e5454744e704a77"
var appSecret="337272746c525a414f4761356173744a577734576b4530794157484f527a4b46353475304a555437474c69665a4f417038685556435a4a6b564f446142697033"
var accessToken= ""
var conversationId=""
var textFromFile=""

//Read the file 


if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}
// Read the file and print its contents.
import fs from 'fs';
   var filename = process.argv[2];
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  textFromFile=data.replace(/\r?\n|\r/g, ",")
  textFromFile=textFromFile.replace(/[&\/\\#+()$~%.'":*?<>{}]/g, '');
  
});



async function getSentiment(myHeaders, conversationId){


	var requestOptions = {
		method: 'GET',
		headers: myHeaders,
		redirect: 'follow'
	};

	fetch("https://api.symbl.ai/v1/conversations/"+conversationId+"/messages?sentiment=true", requestOptions)
	.then((response) => {

		return response.json()
	})
	.then((result) => {

		console.log(result);
		console.log("************************************");
		console.log("Sentiment for the Verse is "+result.messages[0].sentiment.suggested);
		console.log("************************************");
	})
	.catch(error => console.log('error', error));

}

async function processText(){


	if(appId==null|| appSecret==""){
		console.log("Please enter appId and appSecret in Script")
		process.exit();

	}
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");	
	var raw = JSON.stringify({"type":"application","appId":appId,"appSecret":appSecret});
	var requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'follow'
	};

	fetch("https://api.symbl.ai/oauth2/token:generate", requestOptions)
	.then( (response) => {
		return response.json()
	})
	.then((result) => {
		var myHeaders1 = new Headers();
		myHeaders1.append("x-api-key", result.accessToken);
		myHeaders1.append("Content-Type", "application/json");

		var raw = JSON.stringify({"messages":[{"payload":{"content":textFromFile,"contentType":"text/plain"},"from":{"name":"Symbl","userId":"Symbl@example.com"}}]});

		var requestOptions1 = {
			method: 'POST',
			headers: myHeaders1,
			body: raw,
			redirect: 'follow'
		};
		fetch("https://api.symbl.ai/v1/process/text", requestOptions1)
		.then((response) => {
			return response.json()}
			)
		.then((result) => {
			console.log("Text Submitted and conversation Id is "+ result.conversationId)
			conversationId=result.conversationId;
			console.log("Text Submitted and Job Id is "+ result.jobId)
			console.log("For more information abot JobId and ConversationId please visit https://docs.symbl.ai/docs/")

			var requestLoop = setInterval(function(){
				var requestOptions2 = {
					method: 'GET',
					headers: myHeaders1,
					redirect: 'follow'
				};

				fetch("https://api.symbl.ai/v1/job/"+result.jobId, requestOptions2)
				.then((response) => {
					return response.json()}
					)
				.then((result) => {

					console.log("Current job status "+ result.status)
					if(result.status=="completed")
					{
						console.log("Lets check the Sentiment");
						getSentiment(myHeaders1,conversationId);
						clearInterval(requestLoop)
					}
				})
				.catch(error => console.log('error', error));

			}, 5000);


		})
		.catch(error => console.log('error', error)); 

	})
	.catch(error => console.log('error', error));

}

processText();










