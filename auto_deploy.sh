# /bin/bash

# aliyun 自动部署
echo 'Start Deploy...'

SITE_FOLDER_PATH='/www/label_zwglass_net'
if [ ! -d ${SITE_FOLDER_PATH} ];then
    # 网站文件夹不存在，新建文件夹
    mkdir -p ${SITE_FOLDER_PATH}
fi

# 复制到网站文件夹
SERVER_DEPLOY_FOLDER_PATH="/deploy/label_print/frontend_customer/out"
sudo rsync -avP --delete "${SERVER_DEPLOY_FOLDER_PATH}/*" "${SITE_FOLDER_PATH}/"
sudo chmod -R 777 ${SITE_FOLDER_PATH}

# 服务器重新部署 重启 docker (部署完成)
SERVER_DEPLOY_FILE="/deploy/server_self/auto_deploy.sh"
chmod +x ${SERVER_DEPLOY_FILE}
source ${SERVER_DEPLOY_FILE}

echo 'Deploy end'

# 部署完成后进入 docker 启动 uwsge
# docker ps
# docker exec -it <docker_id> /bin/bash
# python manage.py migrate
# uwsgi --ini ./uwsgi_container_produce.ini   # start
# uwsgi --stop ./uwsgi_container_produce.pid  # stop
