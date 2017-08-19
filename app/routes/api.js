var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter'; 
const smtpTransport = require('nodemailer-smtp-transport');
const nodemailer = require('nodemailer'); 
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const crypto = require('crypto');
var mime = require('mime');

/* var dateTime = require('node-datetime'); 

var dt = dateTime.create();

// var formatted = dt.format('m-d-y h-MM-ss TT');
*/

var dateFormat = require('dateformat');
var now = new Date();

var formatted = dateFormat(now, "dddd, mmmm d, yyyy h:MM TT");

module.exports = function(router) {

    let client = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
        user: 'saurabh4creative@gmail.com',
        pass: 'Anita@123'
      }
    }));

     router.post('/edit', (req, res)=>{
         var name = req.body.name;
         var email = req.body.email;
         var per = req.body.permission;
         var user = req.body.username;
         User.findOne({ username: user, email: email }).select('').exec(function(err, user) { 
             if ( err ){
                  res.send(err);
             }
             else if(!user){
                  res.json({success:false, message:'Some Error please contact Administrator'});
             }
             else{
                  user.name = name;
                  user.permission = per;
                  user.save(function(err){
                       if (err) {
                            res.json({success:false, message:'Some Error please contact Administrator'});
                       }
                       else{
                            res.json({success:true, message:'User Edit Successfully'});
                       }
                  });
             }
         }); 
     });

    // User Registration pagel....
    router.post('/register', (req, res)=>{
         
		var user = new User();
		user.username = req.body.username; // Save username from request to User object
		user.password = req.body.password; // Save password from request to User object
		user.email = req.body.email; // Save email from request to User object
		user.name = req.body.name;
    user.userimage = 'default.png'; // Save name from request to User object
		user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        user.date = formatted; 
       
         if( req.body.name == '' || req.body.name == null || req.body.email == '' || req.body.email == null || req.body.username == '' || req.body.username == null || req.body.password == null || req.body.password == '' ) {
         	res.json({success:false, message:'Please Fill all marked fiels'});
         }

         else{
         	 user.save(function(err){
         	 	 if(err){
         	 	 	res.json({success:false, message:'Username and Email Already Exits..'});
         	 	 }
         	 	 else{
                    var email = {
                        from: 'Mean Stack Application',
                        to: [user.email],
                        subject: 'Your Activation Link Mean Stack Application',
                        text: 'Hello ' + user.name + ', thank you for registering at localhost.com. Please click on the following link to complete your activation: http://localhost:4040/activate/' + user.temporarytoken,
                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thank you for registering at localhost.com. Please click on the link below to complete your activation:<br><br><a href="http://localhost:4000/activate/' + user.temporarytoken + '">Activation Link</a>'
                    };
                    // Function to send e-mail to the user
                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err); // If error with sending e-mail, log to console/terminal
                        } else {
                            // console.log(info); // Log success message to console if sent
                            console.log(user.email); // Display e-mail that it was sent to
                        }
                    });
         	 	 	res.json({success:true, message:'User Created..'});
         	 	 }
         	 });
         }
        
    });

    router.post('/authenticate', function(req, res) { 
        var loginUser = (req.body.username);
        if ( loginUser == null || loginUser == '' ){
        	 res.json({ success: false, message: 'Please Enter the username...' });
        }
        else if( req.body.password == '' || req.body.password == null ){
        	 res.json({ success: false, message: 'Please Enter Your Password' });
        }
        else{
            User.findOne({ username: loginUser }).select('email username password active activity').exec(function(err, user) {
	        	if(err){
	        		res.send(err); 
	        	}
	        	else{
	        		if(!user){
	        			res.json({ success: false, message: 'Username not found' });
	        		}
	        		else
	        		 {
	        			 var password = user.password;

	        			     if(password != req.body.password){
	        			        res.json({ success: false, message: 'Username and Password Does Not Match...' });    	
		        			 }
		        			 else{
                                
                                var status = user.active;

                                if(status){

                                     // user.activity = ({id:user.activity.id});

                                     user.save(function(err) {
                                           if(err){
                                              res.json({ success: false, message: err}); 
                                           }
                                           else{
                                               var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '90h' });
                                
                                              res.json({ success: true, message: 'User Login...', token: token });
                                           }
                                     });

                                 }

                                 else{
                                      
                                      res.json({ success: false, message: 'User is not activated please Check your email...'}); 
                                 }

		        			 	       }
                     }
	        	}
	        });
        }
    });
    
    router.put('/activate/:token', function(req, res) {
        User.findOne({ temporarytoken: req.params.token }, function(err, user) {
            if(err){
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            }
            else{
                var token = req.params.token;
                jwt.verify(token, secret, function(err, decoded) {
                    if(err){
                        res.json({success:false, message:'Not Activat please contact administrator..'});
                    }
                    else if(!user){
                        res.json({success:false, message:'Not Activation please contact administrator.'});
                    }
                    else{
                        user.temporarytoken = false;
                        user.active = true;  
                        user.save(function(err) {
                            if(err){
                                res.json({success:false, message:'Not Activation please contact administrator.'});
                            }
                            else{
                                var email = {
                                    from: 'MEAN Stack Staff, saurabh4creative@gmail.com',
                                    to: user.email,
                                    subject: 'Account Activated',
                                    text: 'Hello ' + user.name + ', Your account has been successfully activated!',
                                    html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your account has been successfully activated!'
                                };
                                // Send e-mail object to user
                                client.sendMail(email, function(err, info) {
                                    if (err) console.log(err); 
                                });
                                res.json({success:true, message:'Account Activated..'});
                            }
                        });
                    }
                });
            }
        });
    });

    router.post('/ruser', function(req, res) {
          var password = req.body.password;
          var cpassword = req.body.cpassword;
          var token = req.body.token;
          if( password == '' || password == null || cpassword == '' || cpassword == null){
              res.json({success:false, message:token});
          }
          else if( password != cpassword){
              res.json({success:false, message:'Both password does not same. please check'});
          }
          else{
              User.findOne({ temporarytoken: token }).select('email').exec(function(err, user) { 
                 if(err){
                    res.json({success:false, message:'Please contact administrator'});
                 }
                 else if(!user){
                    res.json({success:false, message:'User password already changed.. or some erroe please contact administrator'});
                 }
                 else{
                    user.temporarytoken = false;
                    user.password = req.body.password; 
                    user.save( function(err){
                       if(err){
                           res.json({success:false, message:'Some error found Please Contact Administrator'});
                       }
                       else{
                          var email = {
                              from: 'MEAN Stack Staff, saurabh4creative@gmail.com',
                              to: user.email,
                              subject: 'Password Changed Notification',
                              text: 'Your Password Has been changed.',
                              html: 'Hello ' + user.name + ', Your Password Has been changed Scuccessfully.'
                          };
                          client.sendMail(email, function(err, info) {
                              if (err) console.log(err); 
                          }); 
                          res.json({success:true, message:'Password Chnaged Scuccessfully..'});
                       }
                   });
                 }
              });
          }
    });

    router.post('/password', function(req, res) {
       var username = req.body.username; 
       if( username == '' || username == null ){
          res.json({success:false, message:'please Enter the username'});
       }
       else{
          User.findOne({ username: username }).select('').exec(function(err, user) {
              if(err){
                   res.json({success:false, message:'Not Activation please contact administrator.'});
              }
              else if(!user){
                   res.json({success:false, message:'Not User found'});
              }
              else{
                   var active = user.active;
                   if( !active ){
                       res.json({success:false, message:'User is not activetd please check your e-mail'});
                   }
                   else{
                      var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                      user.temporarytoken = token;
                      user.save(function(err){
                        if(err){
                            res.json({success:false, message:err});
                        }
                        else{
                            var email = {
                                from: 'MEAN Stack Staff, saurabh4creative@gmail.com',
                                to: user.email,
                                subject: 'Forget Password Link...',
                                text: 'Hello ' + user.name + ', Your account reset link.',
                                html: 'hello <b>' + user.name + '</b> please <a href="http://localhost:4000/forgetpassword/' + user.temporarytoken + '">Click</a> the reset link for reset your password',
                            };
                            // Send e-mail object to user
                            client.sendMail(email, function(err, info) {
                                if (err) console.log(err); 
                            });
                            res.json({success:true, message:'Reset link has been sent your email. please check your email.'});
                        }
                      });
                   }
              }
          });
       }  
    });

    
    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers
        
        if (token) {
            // Function to verify token
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                    next(); // Required to leave middleware
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided'}); // Return error if no token was provided in the request
        }

    });

    router.post('/me', function(req, res) {
        res.send(req.decoded); // Return the token acquired from middleware
    });

    router.post('/data', function(req, res){
  		  User.findOne({ username: req.decoded.username }).select('').exec(function(err, user){
  	    	res.json({success:true, user:user});
  	    });
  	});
    

    router.get('/users', function(req, res){
         /* User.find({}, function(err, users) {
             res.json(users);
         }); */
          User.findOne({ username: req.decoded.username }).select('').exec(function(err, user){
               if(err){
                    res.json({msg:err});
               }
               else{
                    
                    var name = user.username; 

                    User.find({}, function(err, users) {
                         // res.json({msg:users});
                         // var statue = users;

                         var array = [];

                         var classm = '';

                         var st = function(dt){
                            var star = '';   
                            // return chr = chr+("*");;
                            for (var i = 0; i < dt; i++) {
                              star = star+("*");  
                            }
                            return star;
                         }

                         for (var i = 0; i < users.length; i++) {
                            
                            var lengthu = users[i].username.length - 5;  

                            var active = users[i].active;

                            var uname = users[i].username.slice(0, 2) + ''+st(lengthu)+'' + users[i].username.slice(-3);

                            var length = users[i].email.length - 15;

                            var email = users[i].email.slice(0, 3) + ''+st(length)+'' + users[i].email.substr(users[i].email.lastIndexOf("@")-2);   
                            
                            if( name === users[i].username ){
                                var email = users[i].email;
                                uname = users[i].username ;
                                users[i].gallery = 'active';    
                                  
                            } 

                            else{
                                users[i].gallery = 'noneclass';
                            }

                            users[i].email = email;

                            users[i].username = uname;  

                            if(active){
                                array.push(users[i]);
                            }
                         
                         }

                         /* if(statue==='active'){
                            
                         } */

                         res.json({msg:array});
                         
                         
                    });
               }  
          });
    });


    var reset = '';
    var file_name = '';


    var storage = multer.diskStorage({
        
        destination: function (req, file, cb) {
            cb(null, './public/uploads/')
        },
     
        filename: function (req, file, cb) {
          var filetypes = /jpeg|jpg/; 
          crypto.pseudoRandomBytes(16, function (err, raw) {
              if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                 cb("Error: File upload only supports the following filetypes - " + filetypes);
              }
              else{
                  cb(null, raw.toString('hex') + '.' + mime.extension(file.mimetype));
                  return reset = raw.toString('hex') + '.' + mime.extension(file.mimetype);
              }
               
          });
        }

    });

    var upload = multer({ storage: storage });

    router.post('/multer', upload.single('file'), function (req, res, next) {
         // res.json({success:true, message:reset});
          User.findOne({ username: req.decoded.username }).select('activity').exec(function(err, user){
               user.userimage = reset;
               user.save(function(err){
                    if(err){
                        res.json({ success: false, message: 'Contact Administrator'});
                    }
                    else if(!user){
                        res.json({ success: false, message: 'Contact Administrator'});
                    }
                    else{
                        res.json({ success: true, message: 'Image Upload Scuccessfully'});
                    }
               });
          });
    }); 

    
    /*  router.post('/view1', function(req, res) {
        res.json(req.body);
       }); */


     var storages = multer.diskStorage({
        destination: function (request, file, callback) {
          callback(null, '/uploads');
        },
        filename: function (request, file, callback) {
          console.log(file);
          callback(null, file.originalname)
        }
      });
     
     

     router.post('/view1', function(request, response) {
       
       var uploads = multer({storage: storages}).array(request.body.file, 5); 

       uploads(request, response, function(err) {
          if(err) {
            console.log('Error Occured');
            return;
          }
          // request.files is an object where fieldname is the key and value is the array of files 
          console.log(request.file);
          // response.end('Your Files Uploaded');
          response.send(request.body.file);
          console.log('Photo Uploaded');
        })

          

      });


    
    return router;	
};