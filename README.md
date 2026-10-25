# BuptleManager
BuptleBiz, BuptleNova 운영관리 시스템

## 백엔드 실행

### 1. 준비
```bash
cp .env.example .env        # DB_PASSWORD, POSTGRES_PASSWORD 를 채운다 (.env 는 git 에 올라가지 않는다)
docker compose up -d db     # PostgreSQL 17
```
- Spring 은 실행 위치(루트 또는 `app/`)의 `.env` 를 자동으로 읽는다. IDE 실행 설정의 환경변수로 넣어도 된다.
- `DB_PASSWORD` 만 필수이고, 나머지(`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`)는 `.env.example` 의 값이 기본값이다.

### 2. 실행
```bash
./gradlew :app:bootRun
```
- 프로파일은 `SPRING_PROFILES_ACTIVE` 로 정한다. 지정하지 않으면 `local`, 운영은 `prod`.
- 헬스체크: `GET /actuator/health` (공개). 그 외 Actuator 엔드포인트는 노출하지 않는다.
- API 문서(local 전용): `/swagger-ui/index.html`

### 3. 테스트
```bash
./gradlew test
```
- DB 가 필요한 테스트는 Testcontainers(PostgreSQL)를 쓰므로 Docker 가 실행 중이어야 한다.
- 통합 테스트는 `@IntegrationTest` 를 붙인다 (test 프로파일 + 컨테이너 DB).

## 개발 규칙

### 모듈과 패키지
- 모듈별 소스는 `<모듈>/src/main/kotlin/app/buptle/<모듈명>/...` 에 둔다. 패키지가 `app.buptle` 아래여야 Spring 이 자동으로 찾는다.
- 모듈 의존 방향: `app → company, operation, buptlebiz, buptlenova, infra`, `buptlebiz`와 `buptlenova`는 서로 참조하지 않는다.

### DB 스키마
- 스키마 변경은 Flyway 마이그레이션으로만 한다: `infra/src/main/resources/db/migration/V{번호}__{설명}.sql`
- Hibernate 는 `ddl-auto: validate` 로 엔티티와 스키마 일치만 검증한다.
- 이미 적용된 마이그레이션 파일은 수정하지 않고 새 버전을 추가한다.
- 로컬 DB 에 Flyway 도입 전에 만든 테이블이 남아 있으면 기동이 실패한다. 아래로 초기화한다.
  ```bash
  docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "drop schema public cascade; create schema public;"'
  ```

### API 규칙
- 경로는 `/api/...`, 성공 응답은 DTO 를 그대로 반환한다(별도 래퍼 없음).
- 오류는 RFC 9457 `ProblemDetail` 로 응답한다. 항상 `code` 가 있고, 검증 오류는 `errors[{field, message}]` 가 붙는다.
  ```json
  { "type": "about:blank", "title": "Conflict", "status": 409, "detail": "이미 등록된 이메일입니다.", "code": "CONFLICT" }
  ```
- 업무 규칙 위반은 `BusinessException(ErrorCode)` 를 던진다 (`core` 모듈). 예상하지 못한 오류는 내부 정보를 숨기고 500 으로 응답한다.
- 인증이 필요 없는 경로는 `SecurityConfig` 에 명시한 것뿐이다. 새 공개 경로는 반드시 거기에 추가한다.
