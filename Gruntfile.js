module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    shell: {
      terraform: {
        command: () => {
          return 'cd ./infrastructure && terraform -v && terraform init -input=false && terraform apply -auto-approve -input=false';
        },
      },
      localstackUp: {
        command: () => {
          return 'TMPDIR=/private$TMPDIR docker-compose up -d localstack';
        },
      },
      localstackDown: {
        command: () => {
          return 'docker-compose kill -s SIGINT'; // Will kill all docker-compose -d daemons
        },
      },
    },
  });

  grunt.registerTask(
    'del-tf-state',
    'Delete terraform state files',
    function() {
      DATA_DIR_PATH = 'data';
      TF_STATE_FILE_PATH = 'infrastructure/terraform.tfstate';
      TF_STATE_BACKUP_FILE_PATH = `${TF_STATE_FILE_PATH}.backup`;
      const delFile = function(filePath) {
        if (grunt.file.exists(filePath)) {
          grunt.log.write(`Deleting file ${filePath}...`);
          grunt.file.delete(filePath);
          grunt.log.ok();
        }
      };
      delFile(TF_STATE_FILE_PATH);
      delFile(TF_STATE_BACKUP_FILE_PATH);
      delFile(DATA_DIR_PATH);
    }
  );

  grunt.registerTask('wait', 'Blocking wait before next task is run', function(
    ms
  ) {
    var done = this.async();
    grunt.log.write('Going to sleep...');
    setTimeout(function() {
      grunt.log.write('waking up...').ok();
      done();
    }, ms);
  });

  grunt.registerTask('build', [
    'del-tf-state',
    'shell:localstackDown',
    'shell:localstackUp',
    'wait:3600', // Not functionally essential but keeps error logs clean
    'shell:terraform',
  ]);
};
