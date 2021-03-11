#target Illustrator
function mockupInfo()
{
	var valid = true;
	var scriptName = "mockup_info";

	function getUtilities()
	{
		var result = [];
		var utilPath = "/Volumes/Customization/Library/Scripts/Script_Resources/Data/";
		var ext = ".jsxbin"

		//check for dev utilities preference file
		var devUtilitiesPreferenceFile = File("~/Documents/script_preferences/dev_utilities.txt");

		if(devUtilitiesPreferenceFile.exists)
		{
			devUtilitiesPreferenceFile.open("r");
			var prefContents = devUtilitiesPreferenceFile.read();
			devUtilitiesPreferenceFile.close();
			if(prefContents === "true")
			{
				utilPath = "~/Desktop/automation/utilities/";
				ext = ".js";
			}
		}

		if($.os.match("Windows"))
		{
			utilPath = utilPath.replace("/Volumes/","//AD4/");
		}

		result.push(utilPath + "Utilities_Container" + ext);
		result.push(utilPath + "Batch_Framework" + ext);

		if(!result.length)
		{
			valid = false;
			alert("Failed to find the utilities.");
		}
		return result;

	}

	var utilities = getUtilities();
	for(var u=0,len=utilities.length;u<len;u++)
	{
		eval("#include \"" + utilities[u] + "\"");	
	}

	if(!valid)return;

	if(user === "will.dowling")
	{
		DEV_LOGGING = true;
	}

	logDest.push(getLogDest());




	//logic


	function findGarmentLayers()
	{
		log.h("Beginning execution of findGarmentLayers() function.");
		var result = [];

		var garPat = /[fbpm][dmsb][b]?[-_]/i

		var curLay;
		for(var x=0,len=layers.length;x<len;x++)
		{
			curLay = layers[x];
			if(garPat.test(curLay) && findSpecificLayer(curLay,"info","any"))
			{
				log.l("pushing " + curLay + " to result array.");
				result.push(curLay);
			}
		}

		if(!result.length)
		{
			errorList.push("There were no converted templates found in this master file. Cannot proceed.");
			log.e("No Converted templates found. Exiting script.");
			valid = false;
		}

		log.l("end of findGarmentLayers() function. returning::" + result);
		return result;
	}

	function setActiveArtboard(infoLayer)
	{
		for(var x=0;x<infoLayer.pageItems.length;x++)
		{
			curItem = infoLayer.pageItems[x];
			curPos = curItem.pos;
			for(var y=0;y<aB.length;y++)
			{
				if(intersects(curItem,aB[y]))
				{
					result = aB.setActiveArtboardIndex(y);
				}
			}
		}
		app.executeMenuCommand("fitin");
	}

	function loopGarmentLayers()
	{
		var curGarmentLayer;
		var curInfoLayer;
		var newFrameInfo;
		for(var x=0;x<garmentLayers.length;x++)
		{
			curGarmentLayer = garmentLayers[x];
			curInfoLayer = findSpecificLayer(curGarmentLayer.layers,"Info","any");
			
			if(curInfoLayer)
			{
				setActiveArtboard(curInfoLayer);
				newFrameInfo = createDialog(garmentLayers[x].name,getFrameInfo(curInfoLayer));
			}
			else
			{
				errorList.push(curGarmentLayer.name + " has no Information Layer.");
				continue;
			}

			if(newFrameInfo)
			{
				updateFrames(curInfoLayer,newFrameInfo);
			}
			newFrameInfo = undefined;
			curInfoLayer.locked = true;
		}
	}

	function updateFrames(infoLay,frameInfo)
	{
		var curFrame;
		var key;
		for(var x=0;x<infoLay.textFrames.length;x++)
		{
			curFrame = infoLay.textFrames[x];
			key = curFrame.name;
			if(frameInfo[key])
			{
				curFrame.contents = frameInfo[key] + (key.match(/init/i) ?  " " + getDate() : "");
			}
		}
	}

	function getFrameInfo(infoLay)
	{
		// rearrangeInfoTextFrames(infoLay);


		//make an array of all the text frames on the info layer and sort them by name
		var frames = arrayFromContainer(infoLay,"textFrames").sort(function(a,b)
		{
			return (a.name > b.name || a.name.indexOf("Order")>-1) ? 1 : -1;
		})



		var curFrame,curName,curContents;
		for(var x=0;x<frames.length;x++)
		{
			curFrame = frames[x];
			curName = curFrame.name;
			if(!frameInfo[curName])
			{
				//strip out date from initials frame
				frameInfo[curName] = trimDate(curFrame.contents);
			}
			
		}
		return frameInfo;
	}



	function createDialog(garmentName,frameInfo)
	{
		
		var inputGroups = [];
		var w = new Window("dialog");
		var msg = UI.static(w,"Input the appropriate data for " + garmentName);

		var counter = 2;
		var curGroup;
		var len = 20;

		makeInputGroup("Order Number",0)
		// inputGroups[0] = curGroup = UI.group(w);
		// inputGroups[0].orientation = "row";
		// inputGroups[0].msg = UI.static(curGroup,"Order Number",len);
		// inputGroups[0].input = UI.edit(curGroup,frameInfo["Order Number"]);

		makeInputGroup("Mockup Initials",1);
		// inputGroups[1] = curGroup = UI.group(w);
		// inputGroups[1].orientation = "row";
		// inputGroups[1].msg = UI.static(curGroup,"Mockup Initials",len);
		// inputGroups[1].input = UI.edit(curGroup,frameInfo["Mockup Initials"]);


		for(var frameName in frameInfo)
		{

			//skip hidden items, order number, and mockup initials.
			if(hiddenFrames.indexOf(frameName.toLowerCase())>-1 || frameName.match(/order|init/i))
			{
				continue;
			}

			makeInputGroup(frameName,counter)
			

			// inputGroups[counter] = curGroup = UI.group(w);
			// inputGroups[counter].orientation = "row";
			// inputGroups[counter].msg = UI.static(curGroup,frameName,len);
			// inputGroups[counter].input = UI.edit(curGroup,frameInfo[frameName],len*2);
			counter++;

		}

		inputGroups[0].input.active = true;

		var btnGroup = UI.group(w);
		var cancel = UI.button(btnGroup,"Cancel",function()
		{
			valid = false;
			frameInfo = undefined;
			w.close();
		})
		var submit = UI.button(btnGroup,"Submit",function()
		{
			submitDialog(inputGroups);
			w.close();
		})

		w.addEventListener("keydown",function(k)
		{
			if(k.keyName == "Enter")
			{
				submitDialog(inputGroups);
				w.close();
			}
		});

		w.show();

		return frameInfo;
		

		function submitDialog()
		{
			for(var x=0;x<inputGroups.length;x++)
			{
				frameInfo[inputGroups[x].msg.text] = trimDate(inputGroups[x].input.text);
			}
		}

		function makeInputGroup(key,index)
		{
			inputGroups[index] = curGroup = UI.group(w);
			inputGroups[index].orientation = "row";
			inputGroups[index].msg = UI.static(curGroup,key,len);
			inputGroups[index].input = UI.edit(curGroup,frameInfo[key],len*1.5);
		}


	}

	function trimDate(str)
	{
		return str.replace(/[\s-_]?[\d]{2}[\.\/\\][\d]{2}[\.\/\\][\d]{2}/g,"");	
	}

	

	function getDate()
	{
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getYear();
		var yy = yyyy-100;

		if(dd<10) {
			dd='0'+dd
		} 
		if(mm<10) {
			mm='0'+mm
		} 
		debugger;
		return mm+'.'+dd+'.'+yy;
	}


	//make sure the order number text frame(s) are up top
	//and the "hidden frames" are at the bottom.
	function rearrangeInfoTextFrames(infoLay)
	{
		infoLay.locked = false;
		infoLay.visible = true;
		var frames = arrayFromContainer(infoLay,"textFrames");
		frames.forEach(function(a)
		{
			if(a.name.match(/(order)/i))
				a.zOrder(ZOrderMethod.SENDTOBACK);
			else if(a.name.match(/init/i))
			{
				a.zOrder(ZOrderMethod.SENDTOBACK);
				a.zOrder(ZOrderMethod.BRINGFORWARD);
			}
			else if(hiddenFrames.indexOf(a.name.toLowerCase())>-1)
				a.zOrder(ZOrderMethod.BRINGTOFRONT);
			// if(a.name.match(/(order)/i))
			// 	a.zOrder(ZOrderMethod.BRINGTOFRONT);
			// else if(a.name.match(/init/i))
			// {
			// 	a.zOrder(ZOrderMethod.BRINGTOFRONT);
			// 	a.zOrder(ZOrderMethod.SENDBACKWARD);
			// }
			// else if(hiddenFrames.indexOf(a.name.toLowerCase())>-1)
			// 	a.zOrder(ZOrderMethod.SENDTOBACK);
		})
	}




	//end logic





	//global variables
	var docRef = app.activeDocument;
	var aB = docRef.artboards;
	var layers = docRef.layers;
	var garmentLayers = findGarmentLayers();


	/*
	frameInfo format is like so:
		frameInfo = 
			{
				"textFrame.name":"textFrame.contents",
				"Order Number" : "1234567_Team Name_IN",
				"Name":"xxxx"
			}
	*/
	var frameInfo = {};

	//list of things we typically don't want to change.
	//put these at the bottom of the dialog and disable them
	//by default
	var hiddenFrames = ["garment description","garment code","fabric type"];



	


	//procedure
	loopGarmentLayers();


}
mockupInfo();