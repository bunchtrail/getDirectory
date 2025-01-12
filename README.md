# Directory Tree Formatter для VS Code

Расширение VS Code для продвинутого форматирования деревьев директорий с различными режимами вывода.

## Возможности

- 📁 Сканирование и анализ структуры проекта
- 🎨 Несколько режимов форматирования:
  - Минимальный режим для AI
  - Полный режим с детальной статистикой
  - Человекочитаемый режим с визуальным представлением
- 📊 Сбор статистики по типам файлов
- 🔍 Автоматическое "схлопывание" больших директорий

## Использование

1. Откройте командную палитру (Ctrl+Shift+P / Cmd+Shift+P)
2. Введите "Generate Directory Tree"
3. Выберите режим форматирования через настройки

## Настройки

Расширение можно настроить через settings.json:

```json
{
  "directoryTree.showSize": true,
  "directoryTree.aiMinimalMode": false,
  "directoryTree.importantExtensions": [".ts", ".js", ".json"]
}
```

### Описание настроек

- `directoryTree.showSize`: Показывать размер файлов
- `directoryTree.aiMinimalMode`: Использовать минимальный режим для AI
- `directoryTree.importantExtensions`: Список важных расширений файлов

## Примеры вывода

### Человекочитаемый режим

```
📁 src
├── 📁 components
│   ├── 📄 Header.tsx (2.5 KB)
│   └── 📄 Footer.tsx (1.8 KB)
└── 📁 utils
    ├── 📄 helpers.ts (500 B)
    └── 📄 constants.ts (300 B)
```

### Минимальный режим для AI

```json
{
  "name": "src",
  "type": "directory",
  "children": [
    {
      "name": "components",
      "type": "directory",
      "children_skipped": 37,
      "children": "skipped"
    }
  ]
}
```

## Установка

1. Откройте VS Code
2. Перейдите в раздел расширений
3. Найдите "Directory Tree Formatter"
4. Нажмите "Install"

## Требования

- VS Code версии 1.60.0 или выше

## Лицензия

MIT
