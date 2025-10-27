# Kafka Команды

## Producer
```bash
docker exec -ti voltron-nexus_kafka-broker-1_1 kafka-console-producer \
  --topic current-measurements \
  --bootstrap-server localhost:9092
```

## Consumer (читать новые сообщения)
```bash
docker exec -ti voltron-nexus_kafka-broker-1_1 kafka-console-consumer \
  --topic current-measurements \
  --bootstrap-server localhost:9092
```

## Consumer (читать с начала)
```bash  
docker exec -ti voltron-nexus_kafka-broker_1 kafka-console-consumer \
  --topic current-measurements \
  --bootstrap-server localhost:9092 \
  --from-beginning
```

## Список топиков
```bash
docker exec -ti voltron-nexus_kafka-broker-1_1 kafka-topics \
  --list \
  --bootstrap-server localhost:9092
```

## Информация о топике
```bash
docker exec -ti voltron-nexus_kafka-broker-1_1 kafka-topics \
--describe \
--topic current-measurements \
--bootstrap-server localhost:9092
```

# Список всех consumer groups
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-consumer-groups \
--list \
--bootstrap-server localhost:9092
```

#  Информация о конкретной consumer group
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-consumer-groups \
--describe \
--group grid-monitor-group \
--bootstrap-server localhost:9092
```


# Количество сообщений в топике
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-run-class kafka.tools.GetOffsetShell \
--topic current-measurements \
--bootstrap-server localhost:9092 \
--time -1
```

# Проверка работы брокера
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-broker-api-versions \
--bootstrap-server localhost:9092
```


# Создать топик с настройками
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-topics \
--create \
--topic new-topic \
--bootstrap-server localhost:9092 \
--partitions 3 \
--replication-factor 1
```

# Удалить топик
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-topics \
--delete \
--topic new-topic \
--bootstrap-server localhost:9092
```

# Прочитать последние 10 сообщений
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-console-consumer \
--topic current-measurements \
--bootstrap-server localhost:9092 \
--max-messages 10
```

# Показать конфиг топика
```bash
docker exec -ti voltron-nexus_kafka-broker_1 kafka-configs \
--describe \
--topic current-measurements \
--bootstrap-server localhost:9092
```

# Узнать кто является контроллером
```bash
docker exec -ti voltron-nexus_zookeeper_1 zookeeper-shell localhost:2181 get /controller
```