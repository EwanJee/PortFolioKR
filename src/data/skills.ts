export type SkillGroup = { name: string; items: string[] };

export const skills: SkillGroup[] = [
  { name: 'Backend', items: ['Java', 'Kotlin', 'Spring Boot', 'Spring Batch', 'JPA', 'Kotlin JDSL', 'REST API'] },
  { name: 'Data', items: ['MySQL', 'Redis', 'Kafka', 'RabbitMQ', 'Databricks', 'SQL', 'Python'] },
  { name: 'Platform & Quality', items: ['AWS', 'API Gateway', 'Kubernetes', 'GitHub Actions', 'Datadog', 'Grafana', 'Testcontainers', 'TDD', 'Feature Flag'] },
];
