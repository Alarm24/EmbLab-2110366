// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbOYYmaXFL23O7VkIqmPzqmIsrhQmPuEA",
    authDomain: "embtest-afd8c.firebaseapp.com",
    databaseURL: "https://embtest-afd8c-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "embtest-afd8c",
    storageBucket: "embtest-afd8c.appspot.com",
    messagingSenderId: "44096967548",
    appId: "1:44096967548:web:826d595dce334957080af9",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Getting reference to database
var database = firebase.database();
var dataRef1 = database.ref("test/string");

// Fetch the data
dataRef1.on("value", function (snapshot) {
    if (snapshot.exists()) {
        var water = snapshot.val();
        // update(water) ;
        
        setNewWaterLevel(parseFloat(water)) ;
        console.log("Water level:", water); // Log the fetched value
    } else {
        console.log("No data available");
    }
}, function (error) {
    console.error("Error fetching data:", error);
});