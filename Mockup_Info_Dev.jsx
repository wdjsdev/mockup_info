#target Illustrator
function mockupInfo ()
{
	var valid = true;
	var scriptName = "mockup_info";

	function getUtilities ()
	{
		var utilNames = [ "Utilities_Container" ]; //array of util names
		var utilFiles = []; //array of util files
		//check for dev mode
		var devUtilitiesPreferenceFile = File( "~/Documents/script_preferences/dev_utilities.txt" );
		function readDevPref ( dp ) { dp.open( "r" ); var contents = dp.read() || ""; dp.close(); return contents; }
		if ( devUtilitiesPreferenceFile.exists && readDevPref( devUtilitiesPreferenceFile ).match( /true/i ) )
		{
			$.writeln( "///////\n////////\nUsing dev utilities\n///////\n////////" );
			var devUtilPath = "~/Desktop/automation/utilities/";
			utilFiles = [ devUtilPath + "Utilities_Container.js", devUtilPath + "Batch_Framework.js" ];
			return utilFiles;
		}

		var dataResourcePath = customizationPath + "Library/Scripts/Script_Resources/Data/";

		for ( var u = 0; u < utilNames.length; u++ )
		{
			var utilFile = new File( dataResourcePath + utilNames[ u ] + ".jsxbin" );
			if ( utilFile.exists )
			{
				utilFiles.push( utilFile );
			}

		}

		if ( !utilFiles.length )
		{
			alert( "Could not find utilities. Please ensure you're connected to the appropriate Customization drive." );
			return [];
		}


		return utilFiles;

	}
	var utilities = getUtilities();

	for ( var u = 0, len = utilities.length; u < len && valid; u++ )
	{
		eval( "#include \"" + utilities[ u ] + "\"" );
	}

	if ( !valid || !utilities.length ) return;

	DEV_LOGGING = user === "will.dowling";

	app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;


	if ( app.documents.length )
	{
		var doc = app.activeDocument;
		var docsArray = afc( app, "documents" );
		var layers = doc.layers;
		var layArray = afc( doc, "layers" );
		var swatches = doc.swatches;
		var swatchArray = afc( doc, "swatches" );
		var aB = doc.artboards;
		var aBArray = afc( doc, "artboards" );
		var sel, selArray;
		if ( doc.selection.length )
		{
			sel = doc.selection;
			selArray = afc( doc, "selection" );
		}
	}


	var garmentLayers = [];

	layArray.forEach( function ( lay )
	{
		var result = findSpecificLayer( lay, "Information" ) ? true : false;
		result ? garmentLayers.push( lay ) : null;
	} )

	garmentLayers.forEach( function ( garLay, ind )
	{
		garLay.locked = false;
		garLay.visible = true;
		doc.artboards.setActiveArtboardIndex( ind );
		app.executeMenuCommand( "fitin" );
		var infoLay = findSpecificLayer( garLay, "Information" );
		infoLay.locked = false;
		infoLay.visible = true;
		var onFrame = findSpecificPageItem( infoLay, "order", "any" )
		var initFrame = findSpecificPageItem( infoLay, "initial", "any" )
		initFrame.zOrder( ZOrderMethod.BRINGTOFRONT );
		onFrame.zOrder( ZOrderMethod.BRINGTOFRONT );

		var infoText = afc( infoLay, "textFrames" ).filter( function ( tf )
		{
			return !tf.name.match( /mockup label|garment code|description|fabric type/i );
		} )

		var frameInfo = [];

		infoText.forEach( function ( tf )
		{
			var result = { frame: tf, label: tf.name, contents: tf.contents }
			frameInfo.push( result )
		} )

		var inputGroups = [];
		var id = new Window( "dialog", "Garment Info: " + garLay.name );
		var topMsg = UI.static( id, "Enter the Mockup Info" );
		var igGroup = UI.group( id );
		igGroup.orientation = "column";

		frameInfo.forEach( function ( tf )
		{
			var defaultInputTxt = tf.contents.replace( /\d{2}\.\d{2}\.\d{2}/, "" ).replace( /\s*\(last name\)/i, "" );
			var defaultLabelTxt = tf.label.replace( /.*order.*/i, "Order Number Team Name" );
			var g = UI.group( igGroup );
			g.orientation = "row";
			var lbl = g.labelText = UI.static( g, defaultLabelTxt, 20 );
			lbl.justify = "right";
			var input = g.inputText = UI.edit( g, defaultInputTxt, 30 );
			input.addEventListener( "keydown", function ( e )
			{
				if ( e.keyName === "Enter" )
				{
					submit();
				}
			} );
			input.add
			inputGroups.push( g );
		} )

		var btnGroup = UI.group( id );
		var cancelBtn = UI.button( btnGroup, "Cancel", function ()
		{
			id.close();
		} );
		var submitBtn = UI.button( btnGroup, "Submit", submit )

		function submit ()
		{
			inputGroups.forEach( function ( g )
			{
				var input = g.inputText.text;
				var lbl = g.labelText.text;
				frameInfo.forEach( function ( fi )
				{
					if ( fi.label === lbl )
					{
						fi.frame.contents = input || "";
						fi.frame.name.match( /init/i ) ? fi.frame.contents += " " + getDate() : null;
					}
				} )
			} )
			id.close();
		}

		inputGroups[ 0 ].inputText.active = true;

		id.show();

		infoLay.locked = true;
	} );


	return;


}
mockupInfo();