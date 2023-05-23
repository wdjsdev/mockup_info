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



	function makeDialog ( data )
	{
		var label = infoLayers[ 0 ].parent.name;
		aB.setActiveArtboardIndex( 0 );
		app.executeMenuCommand( "fitin" );
		var inputGroups = [];
		var id = new Window( "dialog", "Garment Info: " + label );
		var topMsg = UI.static( id, "Enter the Mockup Info" );
		var igGroup = UI.group( id );
		igGroup.orientation = "column";

		data.forEach( function ( tfd, ind )
		{
			var g = UI.group( igGroup );
			g.orientation = "row";

			var defaultInputTxt = tfd.contents.replace( /^\s*|\s*$|\d{2}\.\d{2}\.\d{2}\s*/g, "" ).replace( /\s*\(last name\)/i, "" );


			var defaultLabelTxt = tfd.label.replace( /.*order.*/i, "Order Number Team Name" );
			var lbl = g.labelText = UI.static( g, defaultLabelTxt + tfd.prefix, 25 );
			lbl.justify = "right";
			var input = g.inputText = UI.edit( g, defaultInputTxt, 30 );
			ind === 0 ? input.active = true : null;
			input.addEventListener( "keydown", function ( e )
			{
				if ( e.keyName === "Enter" )
				{
					submit();
				}
			} );
			inputGroups.push( g );
		} )

		var btnGroup = UI.group( id );
		var cancelBtn = UI.button( btnGroup, "Cancel", function ()
		{
			valid = false;
			id.close();
		} );
		var submitBtn = UI.button( btnGroup, "Submit", submit )

		function submit ()
		{
			inputGroups.forEach( function ( g, ind )
			{
				var input = trimSpaces( g.inputText.text );
				data[ ind ].contents = trimSpaces( data[ ind ].prefix + " " + input );
			} )
			id.close();
		}


		id.show();
	}


	function inputInfoText ( data )
	{
		data.forEach( function ( d )
		{
			infoLayers.forEach( function ( lay )
			{
				var frame = findSpecificPageItem( lay, d.label, "imatch" );
				if ( !frame )
				{
					return;
				}

				frame.contents = d.contents;
				frame.contents = frame.name.match( /init/i ) ? ( frame.contents.replace( /\s/g, "" ) + " " + getDate() ) : frame.contents;
			} );
		} );

	}


	var infoLayers = [];

	layArray.forEach( function ( lay )
	{
		var result = findSpecificLayer( lay, "Information" );
		result ? infoLayers.push( result ) : null;
	} )


	var frameInfo = [];
	var infoFrames = [];
	var frameNames = [];

	//make an array of all the neccesary unique textFrames
	infoLayers.forEach( function ( lay, ind )
	{
		lay.locked = false;
		[ "design", "initial", "order" ].forEach( function ( str ) 
		{
			var frame = findSpecificPageItem( lay, str, "any" );
			if ( !frame ) { return; }
			frame.zOrder( ZOrderMethod.BRINGTOFRONT );
		} )

		//find any textFrames that aren't the mockup label, garment code, description, or fabric type
		afc( lay, "textFrames" ).forEach( function ( tf )
		{
			if ( !tf.name.match( /mockup label|garment code|description|fabric type/i ) && frameNames.indexOf( tf.name ) < 0 )
			{
				frameNames.push( tf.name );
				infoFrames.push( tf );
			}
		} );

	} )

	var prefixRegex = /^.*[\-\:]/i;

	infoFrames.forEach( function ( frame )
	{
		var prefix = frame.contents.match( prefixRegex ) ? ( "  " + frame.contents.match( prefixRegex )[ 0 ] ) : "";
		var contents = frame.contents.replace( prefixRegex, "" );
		var name = frame.name;
		frameInfo.push( { label: name, contents: contents, prefix: prefix } );
	} );

	makeDialog( frameInfo );

	if ( valid )
	{
		inputInfoText( frameInfo );
	}


	return;


}
mockupInfo();