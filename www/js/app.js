// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','pasvaz.bindonce','ngMessages','ionic.cloud'])



.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})
/**
 * categories API calls
 */
  .factory('Playlist', function($http) {
    var cachedData;
    function getData(callback) {

      $http.get('http://superapi.drinkapp.pe/drinkapp_src/getCategorias_v2').success(function(data) {
        cachedData = data;
        callback(data);
      });
    }


    return {

      getPlaylists:getData,
      getProductsCategorie: function($id){
        for (var i = 0; i < cachedData.length; i++) {
          if(cachedData[i].id==$id){
            return cachedData[i];
          }

        }
      }
    }
  })
/**
 * user API calls
 */
  .factory('User', function($http) {
    var cachedUser = undefined;
    var is_over_18 = undefined;
    var promo_view = false;
    function callUserData(loginData,callback) {
      $http({
        method: 'POST',
        url: 'http://superapi.drinkapp.pe/drinkapp_src/login',
        data:loginData,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json'
        }


      }).then(function(resp) {
        // For JSON responses, resp.data contains the result
        cachedUser = resp.data;
        window.localStorage['user'] = angular.toJson(cachedUser);
        callback(resp.status,resp.data);

      }, function(err) {
        // err.status will contain the status code
        callback(err.status,err.data.msg);
        //$scope.error = err.data.msg;

      })
    }
    return {
      is_previos_saw: function (){
        var saw = true;
        if(window.localStorage['previos']==undefined){ // never seen before
            saw = false;
        }
        else{
            var previos = window.localStorage['previos'];
            // so check time
            var timestamp_now = Math.floor(Date.now() / 1000);
            var timestamp_saved =parseInt(previos);
            if(timestamp_saved<timestamp_now){
              //alert('here');
              saw = false;
            }
        }

        return saw;
      },
      is_promo_view:function(){
        return promo_view;
      },
      update_popup_promo_corona:function(new_state){
        promo_view = new_state;
        window.localStorage['promo_view'] = angular.toJson(promo_view);
      },

      update_time_previos_time : function(){
        var previos = Math.floor(Date.now() / 1000);
        previos+=86400; // more 24 hours
        window.localStorage['previos'] = angular.toJson(previos);
      },
      acceptCondition:function(){
        is_over_18 = true;
        window.localStorage['condition'] = angular.toJson(is_over_18);
      },
      is_condition_accepted:function(){
        var trouve = false;
        if(is_over_18!=undefined){
          trouve = true;
        }
        else if(window.localStorage['condition']!=undefined){
          trouve = true;
        }

        return trouve;
      },
      isPuntosUserEnough:function(amountPuntos){
        this.getCurrentUser();
        if(cachedUser.puntos>=amountPuntos){
          return true;
        }
        else{
          return false;
        }
      },
      getCurrentUser:function(){
        if (typeof cachedUser === 'undefined'){
          cachedUser = window.localStorage['user'];
          if (typeof cachedUser === 'string') {
            cachedUser = angular.fromJson(cachedUser);
          }
        }
        return cachedUser;
      },
      login:callUserData,
      loginFacebook:function(userFacebook,callback){
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/loginFacebook',
          data:userFacebook,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      setUserRateUs:function(){
        this.getCurrentUser();
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/rate_us',
          data:{'id':cachedUser.id},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          //callback(resp.status,resp.data);

        }, function(err) {

        })
      },
      setUserCupon:function (code,callback) {
        var user_test = this.getCurrentUser();
        var id_user;
        if(user_test==undefined) id_user = 0;
        else id_user = user_test.id;
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/setCupon',
          data:{'id':id_user,'code':code},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'

          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      getUserPuntos:function(callback){
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/getUserPuntos',
          data:{'id':cachedUser.id},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'

          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      getLastUserOrder:function(callback){
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/getUserLastOrder',
          data:{'id':cachedUser.id},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      logout:function(){
        cachedUser = undefined;
        delete window.localStorage['user'];
      },
      updateUserAfterOrder:function(user){
        cachedUser = user;
        window.localStorage['user'] = angular.toJson(cachedUser);

      },
      updateUser:function(user,callback){
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/updateUser_v2',
          data:user,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      },
      deleteDireccion:function(dir,callback){
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/deleteDireccion',
          data:dir,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          for (var i = 0; i<cachedUser.direcciones.length;i++){
            //alert(cachedUser.direcciones[i].id);
            if(resp.data==cachedUser.direcciones[i].id){
              cachedUser.direcciones.splice(i, 1);
              break;
            }
          }
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      },
      editDireccion:function(dir,callback){
        dir.id_user = cachedUser.id;
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/editDireccion_v3',
          data:dir,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser.direcciones = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,'Dirección editada correctamente.');

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      },
      addDireccion:function(dir,callback){
        dir.id_user = cachedUser.id;
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/addDireccion_v3',
          data:dir,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser.direcciones = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,'Dirección añadida correctamente.');

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      }
    }
  })
/**
 * order API calls
 */
  .factory('Order', function($http) {
    var order = {};
    order.pList = [];
    var master_scope;
    var min_amount_ko = true;
    var min_amount = 50;
    var free_delivery = false;
    return {
      initMasterScope:function(scope){
        master_scope = scope;
      },
      getMasterScope:function(){
        return master_scope;
      },
      clearOrder:function(){
        order.pList = [];
      },
      initCupon:function (cupon) {
        order.cupon = cupon;
      },
      is_min_amount_ok:function(){
        return min_amount_ko;
      },
      getDistritosRepartos:function(callback){
        $http({
          method: 'GET',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/getDistritos',
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result


          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      getLastOrderItems:function(id_order,callback){
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/getOrderItems',
          data:{'id':id_order},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          order.pList = [];
          for (var i =0;i<resp.data.length;i++){
            var obj = {};
            obj.p = resp.data[i].bebida;
            obj.q = resp.data[i].cantidad;
            order.pList.push(obj);


          }
          callback(resp.status);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      updateQuantityOrderProduct:function(p,q,state){
        for (var i =0;i<order.pList.length;i++){
          var obj_order = order.pList[i];
          if(obj_order.p.id==p.id){
            if(state=="more"){
              order.pList[i].q+=q;
            }
            else{
              if(obj_order.q>1){
                order.pList[i].q-=q;
              }
            }
          break;
          }
        }
      },
      addProductToOrder: function(p,q){
          // check if same product selected
          var trouve = false;
          for (var i =0;i<order.pList.length;i++){
            var obj_order = order.pList[i];
            if(obj_order.p.id==p.id){
              trouve = true;
              break;
            }
          }
          if(trouve){
            order.pList[i].q+= q;
          }
          else{
            var obj = {};
            obj.p = p;
            obj.q = q;
            order.pList.push(obj);
          }
      },
      getCurrentOrderCount:function(){
        return order.pList.length;
      },
      is_free_delivery:function(){
        for (var i=0;i<order.pList.length;i++){
          if(order.pList[i].p.free_delivery==true){
            free_delivery = true;
            return true;

          }
        }
        free_delivery = false;
        return false;

      },
      getOrderPuntosAmount:function(){
        var amount = 0;
        for (var i=0;i<order.pList.length;i++){
          if(order.pList[i].p.por_punto){
            var price_init = order.pList[i].p.precio_puntos;
            var quantity = order.pList[i].q;
            amount+= price_init*quantity;
          }

        }
        return amount;

      },
      getOrderAmount:function(){
        var amount = 0;
        for (var i=0;i<order.pList.length;i++){
          var price_init = order.pList[i].p.price;
          var quantity = order.pList[i].q;
          amount+= price_init*quantity;

        }
        var total = Math.round(amount * 100) / 100;
        if(total>=min_amount){
          min_amount_ko = false;
        }
        else{
          min_amount_ko = true;
        }
        if(order.cupon!=undefined){
          total = total*(100-order.cupon.percent)/100;
        }
        if(total>0 && free_delivery==false){
          total+=3.50 // more delivery
        }


        return total.toFixed(2);
      },
      getCurrentOrder:function(){
        return order.pList;
      },
      addPedido:function(user,dir,payment_type,amount_obj,coming_from,callback){
        var data = {
          'dir':dir,
          'user':user,
          'payment_id':payment_type,
          'amount_obj':amount_obj,
          'coming_from':coming_from,
          'order':order
        }
        $http({
          method: 'POST',
          url: 'http://superapi.drinkapp.pe/drinkapp_src/addPedido_v7',
          data:data,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result

          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      }
    }
  })
  .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider,$httpProvider,$ionicCloudProvider) {

    $ionicCloudProvider.init({
      "core": {
        "app_id": "171ec886"
      },
      "push": {
        "sender_id": "253353072562",
        "pluginConfig": {
          "ios": {
            "badge": true,
            "sound": true
          },
          "android": {
            "iconColor": "#343434"
          }
        }
      }
    });

    $httpProvider.defaults.useXDomain = true;
    $ionicConfigProvider.backButton.previousTitleText(false).text('');
    $ionicConfigProvider.views.transition('platform');
    $ionicConfigProvider.views.forwardCache(true);
    if(ionic.Platform.isAndroid()){
      $ionicConfigProvider.scrolling.jsScrolling(false); // native scroll
    }

    $stateProvider
    //$ionicConfigProvider.navBar.alignTitle('center')
      .state('app', {
      url: '/app',
        cache: true,
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.account', {
      url: '/account',
      cache: true,
      //data: {
        requireLogin: true, // this property will apply to all children of 'app'
      //},
      views: {
        'menuContent': {
          templateUrl: 'templates/account.html',
          controller: 'AccountCtrl'
        }
      }

    })

    .state('app.browse', {
        url: '/browse',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html'
          }
        }
      })
      .state('app.playlists', {
        url: '/playlists',
        cache: true,
        //templateUrl: 'templates/playlists.html',
        //controller: 'PlaylistsCtrl',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'PlaylistsCtrl'
          }
        }
      })
      .state('app.order', {
        url: '/order',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/order.html',
            controller: 'OrderCtrl'
          }
        }
      })
      .state('app.checkout', {
        url: '/checkout',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/checkout.html',
            controller: 'CheckoutCtrl'
          }
        }
      })
      .state('app.single', {
        url: '/playlists/:playlistId',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        }
      })
    .state('app.puntos', {
      url: '/playlists/puntos/:playlistId',
        cache: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/puntos.html',
          controller: 'PuntosCtrl'
        }
      }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');


});
