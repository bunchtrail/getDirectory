# Directory Tree Generator для VS Code

Расширение для VS Code, которое генерирует и форматирует деревья директорий в различных форматах.

## Возможности

- 📁 Генерация дерева директорий в различных форматах:
  - Формат для AI (JSON)
  - Человекочитаемый формат с иконками
- 📊 Сбор статистики по файлам и директориям
- 🔍 Гибкая фильтрация и настройка вывода
- 📏 Автоматическое схлопывание больших директорий

## Команды

- `Directory Tree: Generate Tree` - Генерация дерева в стандартном формате
- `Directory Tree: Generate Tree (AI Format)` - Генерация дерева в формате для AI
- `Directory Tree: Generate Tree (Human Format)` - Генерация дерева в человекочитаемом формате

## Настройки

Расширение можно настроить через settings.json:

```json
{
  "directoryTree.showSize": true,
  "directoryTree.aiMinimalMode": false,
  "directoryTree.maxDepth": -1,
  "directoryTree.excludePatterns": ["node_modules", ".git", "dist", "build"]
}
```

### Описание настроек

- `directoryTree.showSize`: Показывать размер файлов
- `directoryTree.aiMinimalMode`: Использовать минимальный режим для AI
- `directoryTree.maxDepth`: Максимальная глубина дерева (-1 для неограниченной)
- `directoryTree.excludePatterns`: Паттерны для исключения файлов и директорий

## Примеры вывода

### Человекочитаемый формат

```
📁 src
├── 📁 components
│   ├── 📄 Header.tsx (2.5 KB)
│   └── 📄 Footer.tsx (1.8 KB)
└── 📁 utils
    ├── 📄 helpers.ts (1.2 KB)
    └── 📄 constants.ts (0.5 KB)
```

### Формат для AI

```json
{
  "metadata": {
    "total_nodes": 6,
    "total_files": 4,
    "total_directories": 2,
    "max_depth": 2,
    "root": "src"
  },
  "extension_stats": {
    "tsx": 2,
    "ts": 2
  },
  "nodes": [...]
}
```

## Установка

1. Откройте VS Code
2. Нажмите `Ctrl+P` / `Cmd+P`
3. Введите `ext install directory-tree-generator`

## Требования

- VS Code версии 1.60.0 или выше

## Лицензия

MIT
