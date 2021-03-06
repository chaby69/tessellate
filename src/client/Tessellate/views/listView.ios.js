'use strict';
//phone dev ip: 10.6.1.173
var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    ListView,
    AlertIOS,
    Image,
} = React;



class UserEventsView extends React.Component {
	
	constructor(props){
	   super(props);
	   this.sectionIDs = ['Created Events', 'Joined Events'];
	   this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2,
	   sectionHeaderHasChanged: (s1, s2) => s1 !== s2})
	   this.state = {
	     dataSource: this.ds.cloneWithRowsAndSections({'Events':[{name:'You don\'t have any events yet...'}]}),
	     dataBlob:{}
	   }
	 }
/**
 * [fetchUserEvents GET request to /events - populates listview dataBlob]
 * 
 */
	fetchUserEvents(){
		var self = this;

		//Object with GET params and Headers
		var getEvents = {  
		  method: 'GET',
		  headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json',
		    'Origin': '',
		    'facebookid':this.props.facebookId,
		  }
		}

		this.props.spin();
		
		//GET request
		fetch('http://tessellate-penguin.herokuapp.com/events', getEvents)  
		  .then(function(res) {
		  	if (!res){
		  		throw new Error('We could not find that event!')
		  	}
		    return res.json();
		   })
		  .then(function(resJson) {
		  	var userID = resJson._id;
		  	var data = resJson.events;
		  	var createdEvents = [];
		  	var joinedEvents = [];

		  	//assign events to joined and created arrays
		  	for (var i = 0 ; i< data.length; i++){

		  		if (userID === data[i]._creator.toString()){
		  			createdEvents.push(data[i]);
		  		} else {
		  			joinedEvents.push(data[i]);
		  		}
		  	}

		  	if (!createdEvents.length){
		  		createdEvents.push({name:'No created events...'})
		  	}

		  	if (!joinedEvents.length){
		  		joinedEvents.push({name:'No joined events...'})
		  	}	

		  	self.props.stopSpin();

  			var tempDataBlob = self.state.dataBlob;
  			tempDataBlob[self.sectionIDs[0]]=createdEvents;
  			tempDataBlob[self.sectionIDs[1]]=joinedEvents;

  			self.setState({
  	              dataSource: self.ds.cloneWithRowsAndSections(tempDataBlob)
  	        })
		    return resJson;
		   })
		  .catch((error) => {
		  	self.stopSpin()
		  	AlertIOS.alert(
		  	   'Whoa! Something Went Wrong.',
		  	   error.message,
		  	   [
		  	     {text: 'Try Again', onPress: () => {self.fetchUserEvents}}
		  	   ]
		  	 );

		  });
	}

	/**
	 * [goToMosaic   push to specified mosaic view]
	 * @param  {[String]} eventCode [event code of mosaic to go to]
	 * 
	 */
	goToMosaic(eventCode){
		this.props.passEventCode(eventCode);
	}

	renderRow(rowData){
		var imageThumbnail = '';
		if (rowData.mainImage){
			imageThumbnail = encodeURI(rowData.mainImage.imgPath);
		}
	   return (
	     <View>
	       <View style={styles.rowContainer}>
	 		 <Image style={styles.eventThumbnail} source={{uri:imageThumbnail||null}}/>
	         <Text style={styles.rowText} onPress={this.goToMosaic.bind(this,rowData.eventCode)}> {rowData.name} |  {'#'}{rowData.eventCode} 
	         </Text>
	       </View>
	     </View>
	   )
	 }


	renderSectionHeader(sectionData, sectionID){
		return (
	      <View style={styles.section}>
	        <Text style={styles.sectionText}>{sectionID}</Text>
	      </View>
      )
	}

	render(){
	    return (
	      <View style={styles.container}>
	          <ListView
	            dataSource={this.state.dataSource}
	            renderRow={this.renderRow.bind(this)}
	            renderSectionHeader={this.renderSectionHeader}
	            renderHeader={() => null} 
	            automaticallyAdjustContentInsets={false}/>
	      </View>
	    )
	  }

};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor:'#FFFFFF',
    position:'relative',
    top:0,
    marginTop:60,
    alignSelf:'stretch',
  },
  section: {

  	marginTop:0,
  	backgroundColor:'#37646F',
  },
  sectionText: {
  	fontSize:22,
  	fontWeight:'700',
  	padding:12,
  	color:'#FFFFFF',
  },
  rowContainer: {
  	flex:1,
  	flexDirection:'row',
  	flexWrap: 'wrap',
   	padding:15,
   	
    backgroundColor:'#FFFFFF',
  }, 
  rowText: {
  	position:'absolute',
  	left:20,
  	marginHorizontal:40,
  	fontSize:14,
  	fontWeight:'500',
  },

  eventThumbnail: {
  	position:'relative',
  	height:35,
  	width:35,
  	
  }
});

module.exports = UserEventsView;