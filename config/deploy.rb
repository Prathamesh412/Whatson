require "bundler/capistrano"
require "rvm/capistrano" # Load RVM's capistrano plugin.
set :application, "woi"
set :rvm_ruby_string, 'ruby-1.9.2-p290@whyzz' # Or whatever env you want it to run in.
set :rvm_type, :user # Copy the exact line. I really mean :user here
set :scm, :git
set :repository, "git@github.com:sourcebitsusa/WOI-web.git"
set :migrate_target, :current
set :ssh_options, {:forward_agent => true}
set :rails_env, "production"
set :normalize_asset_timestamps, false
set :deploy_via, :remote_cache
set :user, "deploy"
set :group, "deploy"
set :use_sudo, false

#QA Server details - cap dev deploy

task :production do
  set :rvm_ruby_string, 'ruby-1.9.2-p290@woi'
  set :deploy_to, "/home/deploy/apps/production/WOI"
  set :branch, "uat5"
  role :web, "176.9.24.201"
  role :app, "176.9.24.201"
  role :db, "176.9.24.201", :primary => true # database master
end

task :staging do
  set :rvm_ruby_string, 'ruby-1.9.2-p290@woi'
  set :deploy_to, "/home/deploy/apps/staging/WOI"
  set :branch, "uat5"
  role :web, "176.9.24.201"
  role :app, "176.9.24.201"
  role :db, "176.9.24.201", :primary => true # database master
end

task :development do
  set :rvm_ruby_string, 'ruby-1.9.2-p290@woi'
  set :deploy_to, "/home/deploy/apps/development/WOI"
  set :branch, "uat5"
  role :web, "176.9.24.201"
  role :app, "176.9.24.201"
  role :db, "176.9.24.201", :primary => true # database master
end

#Production Server details - cap stagging deploy

default_environment["RAILS_ENV"] = 'production'



after 'deploy:update_code', "deploy:copy_rvmrc"
after "deploy:update_code", "deploy:pipeline_precompile"


namespace :db do
  
end

namespace :deploy do
  task(:start) {}
  task(:stop) {}

  task :copy_rvmrc, :roles => :app, :except => {:no_release => true} do
    run "cp #{shared_path}/rvmrc_copy #{release_path}/.rvmrc"
#    run "cp #{shared_path}/config/database.yml #{release_path}/config/database.yml"
    #run "rvm rvmrc trust #{release_path}/"
    #run "ln -nfs #{shared_path}/catalog/ #{release_path}/public/catalog"
    #run "rvm rvmrc trust #{current_path}/server"
  end

  desc 'Restart Application'
  task :restart, :roles => :app, :except => {:no_release => true} do
    run "touch #{File.join current_path, 'tmp', 'restart.txt'}"
  end

  task :pipeline_precompile, :roles => :app, :except => {:no_release => true} do
    run "cd #{latest_release}; RAILS_ENV=production bundle exec rake assets:precompile"
  end
  
end
