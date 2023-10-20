if [ $# -lt 1 ]; then
  exit -1
fi

cd ./model
docker build --tag model_image .
docker run --name model_cont model_image $1