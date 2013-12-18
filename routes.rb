WoiWeb::Application.routes.draw do
  get "appi/index"
  get "appi/reco"
  get "appi/auto"
  get "appi/tsm"
  get "appi/user"


  get "myaccount/index"
  post "myaccount/create"

  get "socialfeed/index"

  get "myprofile/index"
  
  get "discussion/home"

  get "discussion/newdiscussion"

  get "sitemap/index"

  get "privacy/index"

  get "tnc/index"

  get "corporate/index"

  get "contact/index"

  get "about/index"

  get "apps/index"

  get "videos/index"

  get "movies/index"

  get "pop_up/show"
  get "watchlistsocial/index"
  get "favourites/index"
  get "reminders/index"
  # get "watchlistsocial"      => "watchlistsocial#index"
  # get "favourties"           => "favourties#index"
  # get "reminders"            => "reminders#index"

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  get "channels"             => "channel#index"
  get "channels/details"     => "channel#details"
  get "home"                 => "home#index"
  get "languages"            => "languages#index"
  get "genre"                => "genre#index"
  get "languages/accounts"   => "languages#accounts"
  get "programme"            => "programme#index"
  get "programme/info"       => "programme#info"
  get "search"               => "search#index"
  get "movies"               => "movies#index"
  get "videos"               => "videos#index"
  get "apps"                 => "apps#index"
  get "tv-guide"             => "tv-guide#index"
  get "tv-guide/calendar"    => "tv-guide#calendar"
  get "tv-guide/tvoperator"  => "tv-guide#tvoperator"
  get "tv-guide/accountstvoperator" => "tv-guide#accountstvoperator"
  get "pop-up/show"          => "pop-up#show"
  get "pop-up/genre"         => "pop-up#genre"
  get "pop-up/showChannelGenre" => "pop-up#showChannelGenre"
  get "pop-up/showRating"    => "pop-up#rating"
  get "pop-up/reminder"      => "pop-up#reminder"
  get "user/signin"          => "user#signin"
  get "user/signup"          => "user#signup"
  get "user/forgot-password" => "user#forgotPassword"
  get "user/popup_login"     => "user#popup_login"
  get "user/beforeaction"    => "user#beforeaction"
  get "user/watchlist"       => "user#watchlist"
  get "user/reminders"       => "user#reminders"
  get "verify/index"         => "verify#index"
  get "watchlist"            => "watchlist#index"
  get "watchlistinfo"        => "watchlist#info"
  get "movies/popover"       => "movies#popover"
  get "watchlist/calendar"   => "watchlist#calendar"
  get "ip"                   => "ip#index"
  get "actor/profile"        => "actor#profile"

  
  #static api for test
  get "api-demo/index" => "api_demo#index"
  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => 'index#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
