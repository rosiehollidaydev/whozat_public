import React from 'react';
import {
	SectionList ,
	ActivityIndicator,
	Image,
	StyleSheet,
	Text,
	ScrollView,
	View,
	TouchableOpacity,
	Modal,
	Linking,
	} from 'react-native';
import * as FaceDetector from 'expo-face-detector';
import * as Permissions  from 'expo-permissions';
import  * as ImagePicker  from 'expo-image-picker';
import { Camera } from 'expo-camera';
import 'react-native-get-random-values';
import firebase from './config/firebase';
import Environment from './config/environment';
import { FontAwesome } from '@expo/vector-icons';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import { AdMobBanner } from 'expo-ads-admob';
console.disableYellowBox = true;

export default class App extends React.Component {
	state = {
		image: null,
		uploading: false,
		googleResponse: null,
		loading: null,
		type: Camera.Constants.Type.back,
		hasPermission: null,
		faces : [],
		messageText :"",
		photoCount : 0,
		zoom: null,
		modalVisible: false,
		connection_Status:""
	};
	async componentDidMount() {
		await Permissions.askAsync(Permissions.CAMERA_ROLL);
		const { status } = await Permissions.askAsync(Permissions.CAMERA);
		this.setState({ hasPermission: status === 'granted' });
/* 		NetInfo.isConnected.addEventListener(
			'connectionChange',
			this._handleConnectivityChange
	 
		);
	   
		NetInfo.isConnected.fetch().done((isConnected) => {
	 
		  if(isConnected == true)
		  {
			this.setState({connection_Status : "Online"})
		  }
		  else
		  {
			this.setState({connection_Status : "Offline"})
		  }
	 
		}); */
	}	  
	
	/* componentWillUnmount(){
		NetInfo.isConnected.removeEventListener(
			'connectionChange',
			this._handleConnectivityChange
		);
	  }
 */
	render() {
		let { image } = this.state;		
		const { hasPermission } = this.state
		/* if(this.state.connection_Status == "Online")
		{ */
		if(image === null && this.state.uploading == false){
			if (hasPermission === null) {
				return <View />;
			} else if (hasPermission === false) {
				return <Text>No access to camera</Text>;
			} else {
				return (
					<PinchGestureHandler
						onGestureEvent={this.onPinchGestureEvent}
					>
					<View style={{ flex: 1 }}>  
					{this._modal()}
					<Camera ratio="16:9" 
							zoom={this.state.zoom}
							onFacesDetected={this.handleFacesDetected}						
							faceDetectorSettings={{
							mode: FaceDetector.Constants.Mode.fast,
							detectLandmarks: FaceDetector.Constants.Landmarks.none,
							runClassifications: FaceDetector.Constants.Classifications.none,
							minDetectionInterval: 100,
							tracking: false,
						}}
						style={{ flex: 1 }} 
						type={this.state.cameraType} 
						ref={ref => {this.camera = ref; }}
					>
						<View style={{paddingTop:50, paddingLeft:30, paddingBottom:-50}}>
						<TouchableOpacity
								style={{
								backgroundColor: 'transparent',                  
								}}
								onPress={()=> this._setModalVisibility(true)}						>
								<FontAwesome
									name="question-circle-o"
									style={{ color: "#FF3D54", fontSize: 40}}
								/>
							</TouchableOpacity>
						</View>
						<View style={{ flexDirection:"row",justifyContent:"center", margin:20}}>
							<Image source={require('./assets/icon.png')}></Image>
						</View>		
						<View style={{ backgroundColor: 'rgba(0,0,0,0.5)', height:30,margin:20}}>
							<Text style={styles.InfoText}>Find a face and take a picture</Text>
						</View>
						<View style={{flex:1, flexDirection:"row",justifyContent:"space-between",margin:20}}>
							<TouchableOpacity
								style={{
								alignSelf: 'flex-end',
								alignItems: 'center',
								backgroundColor: 'transparent',                  
								}}
								onPress={()=>this._pickImage()}
							>
								<FontAwesome
									name="folder-open-o"
									style={{ color: "#FF3D54", fontSize: 40}}
								/>
							</TouchableOpacity>
							 <TouchableOpacity
								style={{
								alignSelf: 'flex-end',
								alignItems: 'center',
								backgroundColor: 'transparent',
								}}
								onPress={()=>this.takePicture()}
								>
								<FontAwesome
									name="camera"
									style={{ color: "#FF3D54", fontSize: 40}}
								/>
							</TouchableOpacity> 
							<TouchableOpacity
								style={{
								alignSelf: 'flex-end',
								alignItems: 'center',
								backgroundColor: 'transparent',
								}}							
								onPress={()=>this.handleCameraType()}
							>
								<FontAwesome
									name="refresh"
									style={{ color: "#FF3D54", fontSize: 40}}
								/>
							</TouchableOpacity>
						</View>			
					</Camera>
					{ this.state.faces.length ? this.renderFaces() : undefined}	
					<AdMobBanner
					bannerSize="smartBannerPortrait"
					adUnitID="ca-app-pub-1269741571309659/9445394690" // Test ID, Replace with your-admob-unit-id
					servePersonalizedAds // true or false
					onDidFailToReceiveAdWithError={this.bannerError} />	
				</View>
				</PinchGestureHandler>
			
				);
			}
		}
		else{
			return(
				<View style={styles.container}>
				{this._modal()}
				<ScrollView
				>
					<View style={{paddingTop:-300, paddingLeft:30}}>
						<TouchableOpacity
								style={{
								backgroundColor: 'transparent',                  
								}}
								onPress={()=> this._setModalVisibility(true)}						>
								<FontAwesome
									name="question-circle-o"
									style={{ color: "#FF3D54", fontSize: 40}}
								/>
							</TouchableOpacity>
						</View>
					<View style={styles.getStartedContainer}>
							<Image source={require('./assets/icon.png')}></Image>
					</View>

					<View style={styles.helpContainer}>			
						{this._maybeRenderImage()}
						{this._maybeRenderUploadingOverlay()}
					</View>
				</ScrollView>
				<AdMobBanner
					bannerSize="smartBannerPortrait"
					adUnitID="ca-app-pub-1269741571309659/9445394690" // Test ID, Replace with your-admob-unit-id
					servePersonalizedAds // true or false
					onDidFailToReceiveAdWithError={this.bannerError} />	
			</View>
			)
		}
	}
/* 	else
		{
			return(
				<View>
					<Text>You need internet connection to use this app, sorry.</Text>
				</View>
			)
		}
		
	} */

	_modal()
	{
		return(
			<Modal
						animationType="slide"
						transparent={false}
						visible={this.state.modalVisible}
						style={{justifyContent:'middle'}}>

						<View style={{ marginTop: -3 }}>
							<TouchableOpacity
								onPress={()=> this._setModalVisibility(false)}						
								>	
								<FontAwesome
									name="window-close"
									style={{ color: "#FF3D54", fontSize: 40}}
								/>						
							</TouchableOpacity>
							<View style={{ alignContent:'center'}}>
								<View>
									<Text style={{fontWeight:'bold', alignSelf:'center', fontSize:30}}>About your data.</Text>
								</View>
								<View>
									<Text style={styles.ModalText}>Images that you take or select are uploaded to temporary storage on Google Firebase and deleted after 24 hours.</Text>
								</View>
								<View>
									<Text style={styles.ModalText}>Images will be run through the facial recognition software SightEngine to detect celebrity faces.</Text>
								</View>
								<View>
									<Text style={styles.ModalText}>Ads help me pay the costs of running this app. If you want to help, please consider buying me a coffee :)</Text>
									<TouchableOpacity 
										style={styles.CoffeeStyle} activeOpacity={0.5}
										onPress={()=> this.buyCoffee()}
									>
									<Image
										source={{
										uri:
											'https://lh3.googleusercontent.com/UIkaEoI8QwDCjPZJiXJaBholAhue5fHF76vuZEZUAe7hod3VCOar1lPe4D3TbU1m6ys=s180-rw',
										}}
										style={styles.ImageIconStyle}
									/>
									<View style={styles.SeparatorLine} />
									<Text style={styles.TextStyle}> Buy me a coffee </Text>
									</TouchableOpacity>								
								</View>

							</View>
						</View>
					</Modal>      
		)
	}


_handleConnectivityChange = (isConnected) => {
 
    if(isConnected == true)
      {
        this.setState({connection_Status : "Online"})
      }
      else
      {
        this.setState({connection_Status : "Offline"})
      }
  };

	_setModalVisibility(well)
	{
		this.setState({
			modalVisible:well
		});
	}	
	
	buyCoffee()
	{
		Linking.openURL('https://www.buymeacoffee.com/whozat').catch(err => console.error("Couldn't load page", err));
	}

	onPinchGestureEvent = event => {
		console.log(event.nativeEvent.scale);
		var zoomNow = event.nativeEvent.scale/10;
		this.setState({
			zoom: zoomNow
		})
		console.log("zoom level", this.state.zoom);
	  }
	_maybeRenderUploadingOverlay = () => {
		if(this.state.uploading)
		{
		return(
		<View
				style={{
					marginTop: 20,
					width: 250
				}}
			>
				<Text style={{alignSelf:"center", color:"#FF3D54", fontSize:20}}>Uploading.....</Text>
			<ActivityIndicator size="large" color="#FF3D54" />			
		</View>
		)}
	};

	_maybeRenderFace({ bounds,faceID, rollAngle, yawAngle }) {
		return (		
		<View		
			key={uuidv4()}
			transform={[		
			{ perspective: 600 },		
			{ rotateZ: `${rollAngle.toFixed(0)}deg` },		
			{ rotateY: `${yawAngle.toFixed(0)}deg` },		
			]}		
			style={[		
			styles.face,		
				{		
				...bounds.size,		
				left:bounds.origin.x,		
				top:bounds.origin.y,
				},		
			]}
		>		
		</View>		
		);		
	}

	renderFaces = () => 
	{
		return(<View style={styles.facesContainer} pointerEvents="none">
		{this.state.faces.map(this._maybeRenderFace)}
		</View>)
	}
	_maybeRenderImage = () => {
		let { image, googleResponse } = this.state;
		if (!image) {
			return;
		}		
		
		return (
			<View>				
				<View
					style={{
						borderTopRightRadius: 3,
						borderTopLeftRadius: 3,
						shadowColor: 'rgba(0,0,0,1)',
						shadowOpacity: 0.2,
						shadowOffset: { width: 4, height: 4 },
						shadowRadius: 5,
						overflow: 'hidden',
						alignItems:"center"
					}}
				>
					<Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
				</View>
				{!googleResponse && (
					<View style={[styles.container, styles.horizontal]}>
						<Text style={{alignSelf:"center", color:"#FF3D54", fontSize:20}}>Analysing....</Text>
						<ActivityIndicator size="large" color="#FF3D54" />			
					</View>
				)}

				{googleResponse && (
					<Text style={{ paddingVertical: 10, paddingHorizontal: 10 }}>We think this is:</Text>
				)}
				{googleResponse && (
					googleResponse.map((item) =>
						<Text style={{ paddingVertical: 10, paddingHorizontal: 10 }} onPress={()=>this._openIMDB(item.name)} key={item.name}>{item.name} ({Math.ceil(item.prob * 100)}% certainty)</Text> 
					  )					  		
				)}
				
				{googleResponse && (
					<View>
						<Text style={{ paddingVertical: 10, paddingHorizontal: 10 }}>Not quite right? Try again!</Text>
						<TouchableOpacity
								style={{
								alignSelf: 'flex-end',
								alignItems: 'center',
								backgroundColor: 'transparent',
								}}							
								onPress={()=>this._reset()}
							>
								<FontAwesome
									name="refresh"
									style={{ color: "#FF3D54", fontSize: 40}}
								/>
							</TouchableOpacity>
					</View>
				)}
			</View>
		);
	};
	

	_pickImage = async () => {
		let pickerResult = await ImagePicker.launchImageLibraryAsync({
			
			allowsEditing: true,
		});

		this._handleImagePicked(pickerResult);
	};

	_openIMDB(name)
	{
		Linking.openURL('https://m.imdb.com/find?q='+ name +'&ref_=nv_sr_sm');
	}

	_reset = async () =>
	{	
		this.setState({
			image: null,
			uploading: false,
			googleResponse: null,
			loading: null,
			type: Camera.Constants.Type.back,
			faces : [],
			messageText :"",
			photoCount :0,
			zoom:0
		});
	
	}
	_handleImagePicked = async pickerResult => {
		try {
			this.setState({ googleResponse:null});
			this.setState({ uploading: true });
			this.setState({ loading:true});
			console.log("in here");
			if (!pickerResult.cancelled) {

			uploadUrl = await uploadImageAsync(pickerResult.uri)
			if(uploadUrl)
			{
				this.setState({ image: uploadUrl });
				this.submitToGoogle();
			}
		}
		} catch (e) {
			console.log("error here",e);
			alert('Upload failed, sorry :(');
		} finally {
			this.setState({ uploading: false });
		}
	};

	handleFacesDetected = ({ faces }) => {
		if(faces.length > 0){
			console.log("how many faces", faces.length)
			if(this.state.photoCount == 1)
			{
				this.setState({
					messageText:"Processing"
				})
			}
			else
			{
				this.setState({ faces });
			}
			//this.takePicture();
			this.setState({							
			messageText : faces.length +" faces detected. Please scan only one face."
			});

			if(faces.length == 1 && this.state.photoCount == 0)
			{
				//this.setState({							
				//photoCount :1
				//});
				//this.takePicture();										
			}

			}		
		
		else
		{
			this.setState({messageText : "No faces detected"});
		}
	};

	takePicture = async () => {
		console.log("in take picture")
		if (this.camera) {
		  let photo = await this.camera.takePictureAsync({skipProcessing: true});
		  console.log("photo", photo);
		  this._handleImagePicked(photo);
		  this.setState({
			  uploading:true
		  });
		}
		else
		{
			console.log("this.camera is not");
		}
	  }

	handleCameraType=()=>{
		const { cameraType } = this.state
	
		this.setState({cameraType:
		  cameraType === Camera.Constants.Type.back
		  ? Camera.Constants.Type.front
		  : Camera.Constants.Type.back
		})
	  }

	submitToGoogle = async () => {
		try {
			this.setState({ uploading: true });
			let { image } = this.state;			
			const data = { 'models':'celebrities', 'url': image, 'api_user': Environment['SIGHTENGINE_USER'], 'api_secret': Environment['SIGHTENGINE_KEY'] };
			const querystring = encodeQueryData(data);
			var url = 'https://api.sightengine.com/' + '1.0/check.json';
		
			var result= await fetch(url + '?' + querystring).then((res) => {
				return res.json();				  
			}).catch((error) => {
				return error;
			});
			if(result.faces.length > 0 && result.faces[0].celebrity.length > 0){
				this.setState({
					googleResponse: result.faces[0].celebrity,
					uploading: false,
					loading:false
				});
			}
			else{
				this.setState({
					googleResponse: [{"name":"We don't know who this is", "prob":0}],
					uploading: false,
					loading:false
				});
			}
		} catch (error) {
			console.log(error);
		}
	};
}

function encodeQueryData(data) {
	var ret = [];
	for (var d in data)
	  ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
	return ret.join('&');
  }

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function uploadImageAsync(uri) {
	const blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function() {
			resolve(xhr.response);
		};
		xhr.onerror = function(e) {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});

	const ref = firebase
		.storage()
		.ref()
		.child(uuidv4());
		console.log('firebase ref',ref);
	const snapshot = await ref.put(blob);

	blob.close();

	return await snapshot.ref.getDownloadURL();
}
 
const styles = StyleSheet.create({
	InfoText:{
		color: '#fff',
		alignSelf:'center',
		fontSize:20
	},
	container: {
		marginTop:30,
		flex: 1,
		backgroundColor: '#fff',
		paddingBottom: 10
	},
	developmentModeText: {
		marginBottom: 20,
		color: 'rgba(0,0,0,0.4)',
		fontSize: 14,
		lineHeight: 19,
		textAlign: 'center'
	},
	contentContainer: {
		paddingTop: 30
	},

	getStartedContainer: {
		minHeight:100,
		alignItems: 'center',
		marginHorizontal: 50
	},

	getStartedText: {
		fontSize: 17,
		color: 'rgba(96,100,109, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	helpContainer: {
		marginTop: 15,
		alignItems: 'center',
	},
	  camera: {
		flex: 1,
		justifyContent: 'space-between',
	  },
	  topBar: {
		flex: 0.2,
		backgroundColor: 'transparent',
		flexDirection: 'row',
		justifyContent: 'space-around',
	  },
	  bottomBar: {
		flex: 0.2,
		backgroundColor: 'transparent',
		flexDirection: 'row',
		justifyContent: 'space-around',
	  },
	  face: {
		padding: 10,
		borderWidth: 2,
		borderRadius: 5,
		position: 'absolute',
		borderColor: 'yellow',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	  },
	  facesContainer: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		left: 0,
		top: 0,
	  },
	  textcolor:{
		color: '#008080',
	  },
	  ImageIconStyle: {
		padding: 10,
		margin: 5,
		height: 100,
		width: 100,
		resizeMode: 'stretch',
	  },
	  CoffeeStyle: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FF813F',
		borderWidth: 0.5,
		borderColor: '#FF813F',
		marginTop:100,
		width: '97%',
		borderRadius: 5,
		margin: 5,
	  },
	  TextStyle: {
		color: '#fff',
		marginBottom: 4,
		marginRight: 20,
		fontSize: 25
	  },
	  ModalText:{
		alignSelf:'center',
		marginTop:20,
		paddingVertical: 10, 
		paddingHorizontal: 10,
		fontSize:20
	  }
});