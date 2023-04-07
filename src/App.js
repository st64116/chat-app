import './App.css';
import {useEffect, useRef, useState} from "react";
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {collection, addDoc,doc,setDoc, getDoc} from "firebase/firestore";
import {getDatabase, push, ref, onValue} from "firebase/database";
import { getStorage, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";

function App() {

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerEmail, setregisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesContainerRef = useRef(null);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [color, setColor] = useState('#2345fd');
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const firebaseConfig = {
        apiKey: "AIzaSyDur5UEXIl3r3CgavwvjglIbcXf_yWh2ys",
        authDomain: "priprava-chatapp.firebaseapp.com",
        databaseURL: "https://priprava-chatapp-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "priprava-chatapp",
        storageBucket: "priprava-chatapp.appspot.com",
        messagingSenderId: "331402954384",
        appId: "1:331402954384:web:c567e45c65513c1c1d3a15",
        measurementId: "G-0734019DP6"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    // Initialize Firebase Authentication and get a reference to the service
    const auth = getAuth(app);

    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

    // Initialize Realtime Database and get a reference to the service
    const database = getDatabase(app);

    // Initialize Cloud Storage and get a reference to the service
    const storage = getStorage(app);

    const chatRef = ref(database, 'chat/');


    // ======= firebase functions =======

    const login = (event) => {
        event.preventDefault();
        signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            .then((userCredential) => {
                // Signed in
                setUser(userCredential.user);
                setLoggedIn(true);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(errorMessage);
            });
    }

    const uploadImage = async () =>{
        const file = fileInputRef.current.files[0];
        const storageRef = ref(storage, `uploads/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                // handle upload progress here
            },
            (error) => {
                // handle error here
            },
            () => {
                // handle successful upload here
                console.log('File uploaded successfully!');
            }
        );
    }

    const register = async (event) => {
        event.preventDefault();

        // if(!handleFileType()){
        //     return;
        // }else{
        //     await uploadImage();
        // }

        createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
            .then(async (userCredential) => {
                // Signed in
                setUser(userCredential.user);
                await addUserDocument(userCredential.user.uid);
                setLoggedIn(true);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(errorMessage);
            });
    }

    const addUserDocument = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                name: name,
                surname: surname,
                color: color
            });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const sendMessage = () => {
        push(ref(database, 'chat/'), {
            user: user.uid,
            text: message,
            timestamp: Date.now(),
        });
        setMessage('');
    }

    const getColor = async () =>{
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setColor(docSnap.data().color);
        }
    }

    useEffect(() => {
        if (chatRef) {
            onValue(chatRef, (snapshot) => {
                const messagesData = snapshot.val();

                if (messagesData) {
                    const messagesArray = Object.entries(messagesData).map(([id, data]) => ({
                        id,
                        ...data,
                    }));
                    setMessages(messagesArray);
                }
            });
        }
    }, [])

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages])

    useEffect(()=>{
        if(loggedIn){
            getColor();
        }
    },[loggedIn])

    // !! ======= firebase functions =======

    const onChangeHandler = (event, set) => {
        set(event.target.value);
    }

    const handleFileType = (event) =>{
        // console.log();
        const file = fileInputRef.current.files[0];
        const allowedTypes = ['image/png', 'image/jpeg'];

        if (!allowedTypes.includes(file.type)) {
            setError("wrong file type")
            return false;
        }
        return true;
    }

    // useEffect(()=>{
    //     console.log("email", email);
    //     console.log("password", password);
    // },[email,password])

    // useEffect(()=>{
    //     console.log(user);
    // },[user])

    if (!loggedIn) {
        return (
            <section className="vh-100 gradient-custom">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                            <div className="card bg-dark text-white">
                                <div className="card-body p-5 text-center">

                                    <form onSubmit={login}>
                                        <div className="">
                                            <h2 className="fw-bold mb-2 text-uppercase mb-3">Login</h2>
                                            <div className="form-outline form-white mb-4 text-dark">
                                                <div className="form-floating mb-3">
                                                    <input type="email"
                                                           className="form-control"
                                                           id="floatingInput"
                                                           placeholder="name@example.com"
                                                           onChange={(e) => {
                                                               onChangeHandler(e, setLoginEmail)
                                                           }}
                                                           value={loginEmail}/>
                                                    <label htmlFor="floatingInput">Email address</label>
                                                </div>
                                                <div className="form-floating">
                                                    <input type="password"
                                                           className="form-control"
                                                           id="floatingPassword"
                                                           placeholder="Password"
                                                           onChange={(e) => {
                                                               onChangeHandler(e, setLoginPassword)
                                                           }}
                                                           value={loginPassword}/>
                                                    <label htmlFor="floatingPassword">Password</label>
                                                </div>
                                            </div>

                                            <button
                                                className="btn btn-outline-light btn-lg px-5"
                                                type="submit"
                                                onClick={login}>
                                                Login
                                            </button>
                                        </div>
                                    </form>
                                    <hr/>
                                    <div className="mb-4">
                                        <form onSubmit={register}>
                                            <h2 className="fw-bold mb-2 text-uppercase mb-3">Register</h2>

                                            <div className="form-outline form-white mb-4 text-dark">
                                                <div className="form-floating mb-3">
                                                    <input type="email"
                                                           required
                                                           className="form-control"
                                                           id="registerEmail"
                                                           placeholder="name@example.com"
                                                           onChange={(e) => {
                                                               onChangeHandler(e, setregisterEmail)
                                                           }}
                                                           value={registerEmail}/>
                                                    <label htmlFor="registerEmail">Email address</label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input type="password"
                                                           required
                                                           minLength={6}
                                                           className="form-control"
                                                           id="registerPassword"
                                                           placeholder="Password"
                                                           onChange={(e) => {
                                                               onChangeHandler(e, setRegisterPassword)
                                                           }}
                                                           value={registerPassword}/>
                                                    <label htmlFor="registerPassword">Password</label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input type="text"
                                                           required
                                                           className="form-control"
                                                           id="name"
                                                           placeholder="Name"
                                                           onChange={(e) => {
                                                               onChangeHandler(e, setName)
                                                           }}
                                                           value={name}/>
                                                    <label htmlFor="registerPassword">Name</label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input type="text"
                                                           required
                                                           className="form-control"
                                                           id="surname"
                                                           placeholder="Surname"
                                                           onChange={(e) => {
                                                               onChangeHandler(e, setSurname)
                                                           }}
                                                           value={surname}/>
                                                    <label htmlFor="registerPassword">Surname</label>
                                                </div>
                                                <div className="mb-3">
                                                    <label className={"text-light"} htmlFor={"color"}>choose chat color</label>
                                                    <input id={"color"} type="color" value={color} onChange={(e)=>{onChangeHandler(e,setColor)}} className={"form-control"}/>
                                                </div>
                                                {/*<div className="">*/}
                                                {/*    <label className={"text-light"} htmlFor={"image"}>choose profile picture</label>*/}
                                                {/*    <input onChange={handleFileType} ref={fileInputRef} id={"image"} required type="file" accept="image/png, image/jpeg" className={"form-control"}/>*/}
                                                {/*</div>*/}
                                            </div>

                                            <button
                                                className="btn btn-outline-light btn-lg px-5"
                                                type="submit">
                                                Register
                                            </button>
                                        </form>
                                    </div>
                                    <span className={"text-danger"}>{error}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    } else {
        return (
            <section className="vh-100 gradient-custom">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                            <div className="card bg-dark text-white">
                                <div className="card-body p-5">
                                    <h1>Chat</h1>
                                    <div className={"overflow-auto"} style={{height: '400px'}}
                                         ref={messagesContainerRef}>
                                        {messages.map((message) => (

                                            <div key={message.id} className={"row m-0 p-1"}>
                                                {(message.user === user.uid) &&
                                                    <div className={"text-start ms-auto rounded"} style={{
                                                        display: 'inline-block',
                                                        maxWidth: '80%',
                                                        backgroundColor: color
                                                    }}>
                                                        <span

                                                            className={"lead"}>{message.text}</span>
                                                    </div>
                                                }
                                                {(message.user !== user.uid) &&
                                                    <div className={"text-start me-auto bg-secondary rounded"}
                                                         style={{display: 'inline-block', maxWidth: '80%'}}>
                                                        <span
                                                            className={"lead"}>{message.text}</span>
                                                    </div>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                    <div className={"row mt-3"}>
                                        <div className={"col-10 "}>
                                            <input
                                                type="text"
                                                onChange={(e) => {
                                                    onChangeHandler(e, setMessage)
                                                }}
                                                value={message}
                                                className={"form-control"}
                                                onKeyPress={(key) => {
                                                    if (key.charCode === 13) {
                                                        sendMessage();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <button className={"col-2 btn btn-outline-light"} onClick={async () => {
                                            sendMessage()
                                        }}>
                                            send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default App;
