# 🚀 Release Culture & Version Management

Этот проект использует современную релизную культуру с автоматическим управлением версиями и changelog.

## 📋 Conventional Commits

Все коммиты должны следовать формату [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Типы коммитов

- **feat**: ✨ Новые функции
- **fix**: 🐛 Исправления багов
- **docs**: 📚 Изменения в документации
- **style**: 💄 Изменения стиля кода (форматирование, точки с запятой и т.д.)
- **refactor**: ♻️ Рефакторинг кода
- **perf**: ⚡ Улучшения производительности
- **test**: ✅ Добавление или обновление тестов
- **build**: 📦 Изменения в системе сборки
- **ci**: 👷 Изменения в CI конфигурации
- **chore**: 🔧 Другие изменения, не затрагивающие исходный код
- **revert**: ⏪ Откат предыдущих коммитов

### Примеры коммитов

```bash
# ✨ Новые функции
git commit -m "feat: add JWT refresh token support"

# 🐛 Исправления
git commit -m "fix: resolve token expiration issue"

# 📚 Документация
git commit -m "docs: update API documentation"

# ♻️ Рефакторинг
git commit -m "refactor: improve JWT service structure"

# ✅ Тесты
git commit -m "test: add unit tests for password validation"
```

## 🔄 Workflow

### 1. Разработка

```bash
# Создание feature branch
git checkout -b feature/new-jwt-feature

# Внесение изменений
# ... ваш код ...

# Интерактивный коммит
npm run commit

# Push в remote
git push origin feature/new-jwt-feature
```

### 2. Создание Pull Request

1. Создайте PR в GitHub
2. Убедитесь, что все тесты проходят
3. Получите approval от ревьюера
4. Merge в main branch

### 3. Релиз

После merge в main, создайте релиз:

```bash
# Patch release (1.0.0 -> 1.0.1)
npm run release:patch

# Minor release (1.0.0 -> 1.1.0)
npm run release:minor

# Major release (1.0.0 -> 2.0.0)
npm run release:major

# Pre-release
npm run release:alpha  # 1.0.0 -> 1.0.0-alpha.0
npm run release:beta   # 1.0.0 -> 1.0.0-beta.0
npm run release:rc     # 1.0.0 -> 1.0.0-rc.0
```

## 🏷️ Semantic Versioning

Проект следует [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH):

- **MAJOR**: Несовместимые изменения API
- **MINOR**: Новая функциональность (обратно совместимая)
- **PATCH**: Исправления багов (обратно совместимые)

## 📝 Changelog

Автоматически генерируется при каждом релизе и содержит:

- Все изменения, сгруппированные по типу
- Ссылки на коммиты
- Ссылки на сравнение версий
- Ссылки на issues

## 🛠️ Инструменты

- **commit-and-tag-version**: Автоматическое управление версиями
- **commitizen**: Интерактивные коммиты
- **commitlint**: Проверка формата коммитов
- **husky**: Git hooks
- **conventional-changelog**: Генерация changelog

## 📚 Полезные команды

```bash
# Интерактивный коммит
npm run commit

# Запуск тестов
npm test

# Проверка типов
npm run build

# Создание релиза
npm run release

# Очистка
npm run clean
```

## 🔍 Pre-commit Hooks

Автоматически запускаются перед каждым коммитом:

1. **Тесты**: Убеждаемся, что код работает
2. **TypeScript**: Проверяем типы
3. **Linting**: Проверяем качество кода

## 🚨 Troubleshooting

### Ошибка в pre-commit hook

Если pre-commit hook падает:

```bash
# Пропустить hooks для текущего коммита
git commit --no-verify -m "your message"

# Или исправить проблемы и попробовать снова
npm test
npm run build
```

### Проблемы с версиями

```bash
# Сбросить версию
npm version 1.0.0 --no-git-tag-version

# Принудительный релиз
npm run release -- --release-as 1.0.0
```

## 📖 Дополнительные ресурсы

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [commit-and-tag-version](https://github.com/conventional-changelog/standard-version)
- [commitizen](https://github.com/commitizen/cz-cli)
- [husky](https://github.com/typicode/husky)

---

**Следуйте этим правилам для поддержания высокого качества кода и удобства работы команды! 🎯**
