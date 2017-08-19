var app = angular.module('mean', ['ngRoute']);


// Route config...
app.config(function($routeProvider, $locationProvider) {
  
  $routeProvider
   
   .when('/', {
    templateUrl: 'app/views/pages/home.html'
  })

  .when('/about', {
    templateUrl: 'app/views/pages/about.html',
    controller: 'aboutCtrl',
    controllerAs:'about'
  })

  .when('/register', {
    templateUrl: 'app/views/pages/user/register.html',
    controller: 'regCtrl',
    controllerAs:'register'
  })
  
  .when('/login', {
    templateUrl: 'app/views/pages/user/login.html',
    controller: 'loginCtrl',
    controllerAs:'login'
  })

  .when('/activate/:token', {
    templateUrl: 'app/views/pages/user/activate.html',
    controller: 'emailCtrl',
    controllerAs: 'email',
    authenticated: false
  })

  .when('/forget/password', {
    templateUrl: 'app/views/pages/user/fpassword.html',
    controller: 'passCtrl',
    controllerAs: 'password',
    // authenticated: false
  })

  .when('/forgetpassword/:token', {
    templateUrl: 'app/views/pages/user/rpassword.html',
    controller: 'resetpCtrl',
    controllerAs: 'rpassword',
    // authenticated: false
  })

  .when('/profile/detail', {
    templateUrl: 'app/views/pages/user/profile.html',
    controller: 'userCtrl',
    controllerAs:'detail'
  })

  .when('/profile/information', {
    templateUrl: 'app/views/pages/user/information.html',
    controller: 'infoCtrl',
    controllerAs:'information'
  })

  .when('/profile/users', {
    templateUrl: 'app/views/pages/user/user.html',
    controller: 'allCtrl',
    controllerAs:'usera'
  })
  
  .when('/profile/edit', {
    templateUrl: 'app/views/pages/user/edit.html',
    controller: 'editCtrl',
    controllerAs:'edit'
  });

  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);

});


app.controller('allCtrl', function(User, $scope){
        
        User.users().then(function(data) {
            console.log(data);  
            $scope.data = data.data.msg;
            
        });

        $scope.start = 0;

});

app.controller('main', function($scope, $location, AuthToken, $rootScope, User, $timeout){
	
  $scope.name = 'Mean Stack Application';
  
  $scope.btn = false;

  $scope.logout = function(){
       AuthToken.setToken();
       $timeout(function() {
          $location.path('/login');
       }, 2000);
  }

  $scope.forget = function(){
       $location.path('/forget/password');
  }

  $rootScope.$on('$routeChangeSuccess', function() {
     if(AuthToken.getToken()){
         // console.log(AuthToken.getToken());
         if(User.isLoggedIn()){
               $scope.btn = true; 
         }; 
     }
     else{
         $scope.btn = false;
     }      
  });

  User.getUser().then(function(data) {
       // console.log(data);
       /* if(!data.success){
         //  AuthToken.setToken();
          $scope.btn = false;
          // console.log(data);
          /*  if(!data.data.success){
               $timeout(function() {
                  $location.path('/login');
               }, 0);  
            }*/ 
       /* }
       else{
          $scope.btn = true;
       }*/
        if( data.data.success ){
           console.log('sa');
           // console.log(data);
        } 
        else{
           // console.log(data);
           AuthToken.setToken();
           $scope.btn = false;
        }
  });

});

app.controller('aboutCtrl', function(){
    console.log('About Us Page');
});



app.controller('infoCtrl', function($scope, $http, User,  $window, $route, $timeout){
    
    // $scope.image = function(){
          User.getUser().then(function(data) {
              //  console.log(data);
               $scope.image = data.data.user.userimage;
          });
    // };


    // $scope.image();

    $scope.uploadFile = function(){
        var file = $scope.myFile;

        if( $scope.myFile == '' || $scope.myFile == null ){
            $scope.msg = 'Please select The image...';
        }

        else{
          
          var str = file.name;

          var n = str.split('.').pop();

          if(str.match(/\.(jpg|jpeg|png|gif)$/)){
              
              var uploadUrl = "/api/multer";
          
              var fd = new FormData();
              
              fd.append('file', file);

              $http.post(uploadUrl,fd, {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': undefined}
              })
              
              .then(function(data){
                 
                 $timeout(function() {
                      $scope.image = function(){
                          User.getUser().then(function(data) {
                               // console.log(data);
                               $scope.image = data.data.user.userimage;
                          });
                      };  
                      $scope.msg = data.data.message;
                      $scope.image();
                 }, 0);    

              });

              // $scope.image();

          }
          else{
              $scope.msg = 'Please Check File type.'+n+' Does Not Accepted';
          }
       }
    
    };



    // $scope.uploadFile();
     
     var _this = this;

     var name = [];

     $scope.uploadGallery = function(data){
           /*console.log($scope.mlFile[0].name);
           for (var i = 0; i < $scope.mlFile.length; i++) {
                name.push({name: $scope.mlFile[i].name});
           }*/
           // console.log(name);
           // var name = {name :$scope.mlFile[0].name};
           /* User.gallery(name).then(function(data){
              console.log(data.data.file);
           }); */

     };

     this.gallary_data = function(data){
        
        console.log(_this.data);
          
     }

});

app.directive('fileModel', ['$parse', function ($parse) {
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;

          element.bind('change', function(){
              scope.$apply(function(){
                  modelSetter(scope, element[0].files[0]);
              });
          });
      }
  };
}]);

app.directive('multiModel', ['$parse', function ($parse) {
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          var model = $parse(attrs.multiModel);
          var modelSetter = model.assign;

          element.bind('change', function(){
              scope.$apply(function(){
                  modelSetter(scope, element[0].files);
              });
          });
      }
  };
}]);

app.directive("imageData",function() {
    var directive = {};

   //  directive.restrict = 'E';

    directive.template = 's';

    return directive;
});


app.controller('editCtrl', function($scope, User, $timeout, $location){
    
    var _this = this;

    $scope.editrel = function(names, unames, email, user){
       var editData = {
               name:names,
               username:unames,
               email:email,
               permission:user
       };
       
       User.edit(editData).then(function(data){
             $scope.datas = data.data.message;
             if(data.data.success){
                 $timeout(function() {
                    $location.path('/profile/detail');
                 }, 2000); 
             }
       }); 

    };

    $scope.cars = ['user','moderator'];

    User.getUser().then(function(data) {
        // console.log(data);
        $scope.names = data.data.user.name;
        $scope.unames = data.data.user.username;
        $scope.email = data.data.user.email;
        var demo = data.data.user.permission;
        if( demo == 'user' ){
            $scope.user= $scope.cars[0];         
        }
        else if(demo == 'moderator'){
            $scope.user= $scope.cars[1];
        }
        else{
            $scope.user= $scope.cars[0];
        }
    });
});

app.controller('resetpCtrl', function($scope, User, $routeParams, $timeout, $location){
     var _this = this;
     var token = $routeParams.token;
     // console.log('Reset Password Page');
     this.pass_data = function(data){
          _this.data.token = token;
          User.resetpassword(_this.data).then(function(data){
              $scope.message = data.data.message;
               if( data.data.success ){
                   $timeout(function() {
                      $location.path('/login');
                   }, 2000); 
               }     
          });
     }
});

app.controller('emailCtrl', function(User, $routeParams, $scope, $location, $timeout){
     User.activateAccount($routeParams.token).then(function(data) {
          if (data.data.success) {
              $scope.successMsg = data.data.message;
          } 
          else{
              $scope.successMsg = data.data.message;
          }
     });
});

app.controller('userCtrl', function(User, $scope, $timeout, $location){
    if(User.isLoggedIn()){
        User.getUser().then(function(data) {
              console.log(data);
              if(!data.data.success){

              }
              else{
                $scope.usname     = data.data.user.name;
                $scope.email      = data.data.user.email;
                $scope.uname      = data.data.user.username;
                $scope.status     = data.data.user.active;
                $scope.permission = data.data.user.permission;
                $scope.date       = data.data.user.date;
                $scope.activity   = data.data.user.userimage;
              }
        });
    }
});

app.controller('loginCtrl', function($scope, User, AuthToken, $timeout, $location){
   console.log('login panel');
   var _this = this;
   if(User.isLoggedIn()){
      $location.path('/profile/detail');
   }
   this.log_data = function(data){
        User.login(_this.data).then(function(data){
           $scope.message = data.data.message;
           AuthToken.setToken(data.data.token);

           if( data.data.success ){
               $timeout(function() {
                  $location.path('/profile/detail');
               }, 2000); 
           }
        }); 
   };
});

app.controller('regCtrl', function(User, $scope){
   var _this = this;
   $scope.message = 'Please Wait...';	
   this.reg_data = function(data){
   	     User.create(_this.data).then(function(data) {
   	     	 $scope.message = data.data.message;
         });
   }
});

app.controller('passCtrl', function(User, $scope){
  var _this = this;
   this.pass_data = function(data){
       User.password(_this.data).then(function(data) {
            console.log(data);
            $scope.message = data.data.message;
      });
   }
});

app.factory('User', function($http, AuthToken){
     var userFactory = {};

     userFactory.create = function(regData) {
        return $http.post('/api/register', regData);
     };

     userFactory.users = function(){
        return $http.get('/api/users');
     };

     userFactory.gallery = function(gallery) {
        return $http.post('/api/gallery', gallery);
     };

     userFactory.view = function(gallery) {
        return $http.post('/api/view1', gallery);
     };

     userFactory.edit = function(eData) {
        return $http.post('/api/edit', eData);
     };

     userFactory.login = function(loginData) {
        return $http.post('/api/authenticate', loginData).then(function(data) {
            // AuthToken.setToken(data.data.token); // Endpoint will return a token to set
            return data;
        });
     };

     userFactory.password = function(passData) {
        return $http.post('/api/password', passData).then(function(data) {
             return data;
        });
     };

     userFactory.resetpassword = function(rpassData) {
        return $http.post('/api/ruser', rpassData).then(function(data) {
             return data;
        });
     };

      userFactory.getUser = function() {
          // Check first if user has a token
         /*  if (AuthToken.getToken()) {
              return $http.post('/api/data'); // Return user's data
          } else {
              $q.reject({ message: 'User has no token' }); // Reject if no token exists
          } */
          return $http.post('/api/data'); 
      }; 

      userFactory.isLoggedIn = function(){
         if(AuthToken.getToken()){
             return true;
         }
         else{
             return false;
         }
     };

      userFactory.activateAccount = function(token) {
          return $http.put('/api/activate/' + token);
      };

     return userFactory;
});

app.factory('AuthToken', function($window) {
    var authTokenFactory = {}; // Create factory object

    // Function to set and remove the token to/from local storage
    authTokenFactory.setToken = function(token) {
        // Check if token was provided in function parameters
        if (token) {
            $window.localStorage.setItem('token', token); // If so, set the token in local storage
        } else {
            $window.localStorage.removeItem('token'); // Otherwise, remove any token found in local storage (logout)
        }
    };

    // Function to retrieve token found in local storage
    authTokenFactory.getToken = function() {
        return $window.localStorage.getItem('token');
    };

    return authTokenFactory; // Return factory object
})

// Factory: AuthInterceptors is used to configure headers with token (passed into config, app.js file)
app.factory('AuthInterceptors', function(AuthToken) {
    var authInterceptorsFactory = {}; // Create factory object

    // Function to check for token in local storage and attach to header if so
    authInterceptorsFactory.request = function(config) {
        var token = AuthToken.getToken(); // Check if a token is in local storage
        if (token) config.headers['x-access-token'] = token; //If exists, attach to headers

        return config; // Return config object for use in app.js (config file)
    };

    return authInterceptorsFactory; // Return factory object

});

app.config(function($httpProvider){
   $httpProvider.interceptors.push('AuthInterceptors')
});




 app.directive('ngFileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        var model = $parse(attrs.ngFileModel);
        var isMultiple = attrs.multiple;
        var modelSetter = model.assign;
        element.bind('change', function () {
            var values = [];
            angular.forEach(element[0].files, function (item) {
                var value = {
                   // File Name 
                    name: item.name,
                    // File Size 
                    // size: item.size,
                    // File URL to view 
                    // url: URL.createObjectURL(item),
                    // File Input Value 
                    // _file: item
                };
                values.push(value);
            });
            scope.$apply(function () {
                if (isMultiple) {
                    modelSetter(scope, values);
                } else {
                    modelSetter(scope, values[0]);
                }
            });
        });
      }
  };
  }]);


      app.controller('view1Ctrl', function($scope, $http, User) {
        $scope.s = function() {
             var file = $scope.myFile;
             var payload = new FormData();
             
            //  console.dir($scope.myFile);
            //  payload.append('file', $scope.myFile);
            //  payload.append('desc', $scope.desc)
            //  console.log(payload);
            //  console.log(file[0]);
           
            /* $http.post('/api/view1',file).then(function(data) {
                console.log(data);
            }); */

            

            var jsonString = JSON.stringify(file);

            var obg =  [{
                file: jsonString,
                data:true,
            }];

            // obg.push({jsonString});

            // console.log(obg[0]);

            /* var name = {
                  name:'saurabh',
                  class:'rwp'
            };*/


           //  console.log(name);

            User.view(obg[0]).then(function(data){
                console.log(data);
            });

        }
         
         $('#upload-photos').on('click', function (event) {
              
              alert();

              event.preventDefault();

              // Get the files from input, create new FormData.
              var files = $('#photos-input').get(0).files,
                  formData = new FormData();

              if (files.length === 0) {
                  alert('Select atleast 1 file to upload.');
                  return false;
              }

              if (files.length > 3) {
                  alert('You can only upload up to 3 files.');
                  return false;
              }

              // Append the files to the formData.
              for (var i=0; i < files.length; i++) {
                  var file = files[i];
                  formData.append('photos[]', file, file.name);
              }

              // Note: We are only appending the file inputs to the FormData.
              uploadFiles(formData);
          }); 

  });



