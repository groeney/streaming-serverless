module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      lambda: {
        files: [
          'infrastructure/lambda/**/fn/index.js',
          'infrastructure/lambda/**/fn/package.json',
          'infrastructure/lambda/lib/helpers*.js',
        ],
        tasks: ['redeploy'],
      },
    },
    env: {
      dev: {
        src: '.env',
      },
    },
    shell: {
      infraUp: {
        command: () => {
          return (
            'cd ./infrastructure && terraform -v ' +
            '&& terraform init -input=false ' +
            '&& terraform apply -auto-approve -input=false'
          );
        },
      },
      lambdaUp: {
        command: () => {
          return (
            'cd ./infrastructure && terraform -v ' +
            '&& terraform init -input=false ' +
            '&& terraform apply -auto-approve -input=false ' +
            '-target=module.tasks_validator -target=module.email_executer' // Keep up to date
          );
        },
      },
      localstackUp: {
        command: () => {
          return 'TMPDIR=/private$TMPDIR docker-compose up -d localstack';
        },
      },
      localstackDown: {
        command: () => {
          return 'docker-compose down';
        },
      },
      up: {
        command: () => {
          return 'TMPDIR=/private$TMPDIR docker-compose up';
        },
      },
    },
  });

  grunt.registerTask(
    'del-tf-state',
    'Delete terraform state files',
    function() {
      DATA_FP = 'data';
      TF_STATE_FP = 'infrastructure/terraform.tfstate';
      TF_STATE_BACKUP_FP = `${TF_STATE_FP}.backup`;
      const delFile = function(filePath) {
        if (grunt.file.exists(filePath)) {
          grunt.log.write(`Deleting file ${filePath}...`);
          grunt.file.delete(filePath);
          grunt.log.ok();
        }
      };
      delFile(TF_STATE_FP);
      delFile(TF_STATE_BACKUP_FP);
      delFile(DATA_FP);
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
    'env:dev',
    'shell:infraUp',
  ]);
  grunt.registerTask('redeploy', ['env:dev', 'shell:infraUp']);
  grunt.registerTask('start', ['build', 'env:dev', 'shell:up']);

  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
