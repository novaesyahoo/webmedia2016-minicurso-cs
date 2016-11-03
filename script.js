var images = [];		//Array to store the images URL;
var contrs = [];		//Array to store the contributions: {time_start, time_stop,image_url, image_class, user_id, contr_id}
var goldenImgsIds = 	//Array with our golden images
	["http://goo.gl/QsuqUq",
	"http://goo.gl/VRAKdt"];
var id;					//Stores the user fingerprinting;
var counter = 0;		//Sets in which step the user is;
var contrNumber = 5;	//HowMany contribution we want;
var btnBar;				//Reference to the ButtonBar;
var img;				//Reference to the image container;
var out;				//Reference to the output field;
var time = 0;			//Stores how long the took the contribution;
var stamp = new Date().getTime(); //A stamp to this contribution;

//Function called when the HTML is done;
window.onload = function(){
	//Connects to the image service, and retrieves images;
	images = loadRemoteImages();
	//Inserts a Golden Standard
	images = goldenStandardIn(images);
	//Gets the references to the html elments;
	img = document.getElementById("image");
	btnBar = document.getElementById("btn_Bar");
	out = document.getElementById("out");
	//Gets the user fingerprinting and attributes it to the id variable;
	//This is an asynchronous function;
	new Fingerprint2().get(function(result, components){
  		this.id = result;
	});
	//Starts the application listeners;
	initListeners();
	//Starts the first contribution;
	nextContribution();
}
//Randomly inserts a golden image in one of the images position;
function goldenStandardIn(images){
	//The position to put the golden image;
	var r1 = Math.floor(Math.random() * contrNumber);
	//One of the listed golden images;
	var r2 = Math.floor(Math.random() * (goldenImgsIds.length));
	//replaces the position;
	images[r1] = goldenImgsIds[r2];
	return images;
}
//Loads the next contribution from the user;
function nextContribution(){
	out.innerHTML = (counter+1)+ '/' + contrNumber;
	//Sets the image to be evaluated and shows the buttons;
	img.src = images[counter];
	//Ao carregar a imagem;
	img.addEventListener("load",function(){
		btnBar.style.display = 'block';
		//Starts counting time;
		time = new Date().getTime();
	});
}
//Starts the application listeners;
function initListeners(){
	btnBar.addEventListener("click",buttonClick);
}
//Handles the Click of the buttons;
function buttonClick(event){
	//Stops counting time, and saves its duration;
	time = (new Date().getTime()) - time;
	//Hides the image and blocks the buttons, so users don't click twice;
	img.src = '';
	btnBar.style.display = 'none';
	//Creates an contribution:
	var c = {
		time: time,
		image_url: 	images[counter], 
		image_class:event.target.value, 
		user_id: 	id, 
		contr_id: 	id + stamp
	}
	//Adds the contribution to the contribution array;
	contrs.push(c);
	//Increments the counter;
	counter++;
	//If all the contributions are done, sends the contribution to the database;
	if(counter >= contrNumber){
		sendContributions(contrs);
	//Else, gets the next contribution;
	}else{
		nextContribution();		
	}
}
//Send all contributions, one by one;
function sendContributions(cs){
	//Hide all interface components;
	btnBar.style.display = 'none';
	img.style.display = 'none';
	document.getElementById('question').style.display = 'none';
	//Informs that all informations are being sent;
	out.innerHTML = 'Sending Answers.'
	for(var i = 0; i < cs.length; i++){
		storeContribution(cs[i]);
	}
	//Thanks the contribution.
	out.innerHTML = 'Answers Sent, Thank YOU !! :)';
	//Creates a link to reload the page, and contribute again;
	var a = document.createElement('a');
	var linkText = document.createTextNode("my title text");
	a.innerHTML = "Click here to Contribute again";
	a.href = "./index.html";
	document.getElementById('app').appendChild(a);
}

//Sends teh contribution to the Database
function storeContribution(c){
	//Your Spreadsheet URL;
	var url = "https://docs.google.com/forms/d/e/1FAIpQLSdmsOv8fClwcIBySn-f1xmGO2oHlK-sA_AIvqY7hU-5NrdNww";
	//The form we send our infromation;
	var action = 'formResponse';
	//The field's id extraceted earlier:
	var fields = ['entry.413905428','entry.253220136','entry.1242187282','entry.294318778','entry.482353193'];
	//We construct the URL to the database;
	var str = url+'/'+action+'?' 	+
		fields[0]+'='+c.time	+ '&' +
		fields[1]+'='+c.image_url	+ '&' +
		fields[2]+'='+c.image_class	+ '&' +
		fields[3]+'='+c.user_id		+ '&' +
		fields[4]+'='+c.contr_id;
	console.log(str);
	
	//We send the form;
	fetch(str,{mode: 'no-cors'});
}
//Loads the images from the picture server;
function loadRemoteImages(){
	//Local array to store the images URL;
    var imgs = [];
    //Gets five images from facebook randomly (from a specific range)
    for(var i=0; i < 5; i++) {
		rnd = Math.floor(Math.random() * 1000)%50 + 100000;
        url = "http://graph.facebook.com/v2.5/" + rnd + "/picture?height=300&height=300";
		imgs[i] = url;
    }
    //Retruns the array;
    return imgs;
}
