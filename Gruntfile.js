module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      jsLambda: {
        files: [
          'infrastructure/lambda/js/**/fn/index.js',
          'infrastructure/lambda/js/**/fn/package.json',
          'infrastructure/lambda/js/lib/helpers*',
          'infrastructure/lambda.tf',
          'infrastructure/lambda/terraform/**/main.tf',
        ],
        tasks: ['deploy'],
      },
      pyLambda: {
        files: [
          'infrastructure/lambda/py/**/fn/index.py',
          'infrastructure/lambda/py/lib/*helpers*',
          'infrastructure/lambda.tf',
          'infrastructure/lambda/terraform/**/main.tf',
        ],
        tasks: ['deploy'],
      },
      terraform: {
        files: [
          '**/*.tf'
        ],
        tasks: ['shell:formatTf']
      },
    },
    env: {
      dev: {
        src: '.env',
      },
    },
    shell: {
      dockerWatch: {
        command: () => {
          return 'watch -n 1 docker ps -a';
        },
      },
      formatTf: {
        command: () => {
          return 'terraform fmt .'
        }
      },
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
      stackDown: {
        command: () => {
          return 'docker-compose down && if [[ $(docker ps -aq) ]]; then docker rm -f $(docker ps -aq); fi';
        },
      },
      stackUp: {
        command: () => {
          return 'TMPDIR=/private$TMPDIR docker-compose up';
        },
      },
    },
  });

  /**** Register Tasks ****/
  /* TLT (Top Level Tasks) */
  grunt.registerTask('start', ['cleanup', 'build', 'shell:stackUp']);
  grunt.registerTask('deploy', ['env:dev', 'shell:infraUp']);
  grunt.registerTask('cleanup', ['del-tf-state', 'shell:stackDown']);
  grunt.registerTask('docker', ['shell:dockerWatch']);

  /* STs Secondary Tasks */
  grunt.registerTask('build', [
    'shell:localstackUp',
    'wait:5000', // Not functionally essential but keeps error logs clean
    'deploy',
  ]);

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

  /**** Grunt plugins ****/

  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
