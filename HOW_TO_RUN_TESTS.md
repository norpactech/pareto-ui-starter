# Running User Service Integration Test in VS Code

## 🎯 **Multiple Ways to Run the Test**

### **Method 1: VS Code Command Palette (Recommended)**

1. **Open Command Palette**: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. **Type**: `Tasks: Run Task`
3. **Select**: `Run User Service Integration Test`

This will run only your specific integration test file.

### **Method 2: VS Code Menu Bar**

1. **Top Menu**: `Terminal` → `Run Task...`
2. **Select**: `Run User Service Integration Test`

### **Method 3: VS Code Test Explorer (if Jest extension is installed)**

1. **Install Extension**: "Jest" by Orta (if not already installed)
2. **Open Test Explorer**: View → Test Explorer
3. **Find your test** in the explorer tree
4. **Click the play button** next to the test

### **Method 4: Integrated Terminal**

1. **Open Terminal**: `Ctrl+`` (backtick)
2. **Run Command**:
   ```bash
   npm run test:jest -- src/tests/integration/user-service.integration.spec.ts
   ```

### **Method 5: Right-Click Context Menu (with Jest extension)**

1. **Right-click** on the test file in Explorer
2. **Select**: `Run Jest Tests`

## 🚀 **Available VS Code Tasks**

I've configured several tasks for you:

### **Specific Tests:**
- **`Run User Service Integration Test`** - Runs only your user service test
- **`Run All Integration Tests`** - Runs all integration tests
- **`Run Jest Tests with Coverage`** - Runs all tests with coverage report

### **Access Tasks via:**
- Command Palette: `Ctrl+Shift+P` → `Tasks: Run Task`
- Menu Bar: `Terminal` → `Run Task...`
- Keyboard Shortcut: `Ctrl+Shift+P` then type task name

## 🔧 **Terminal Commands Available**

```bash
# Run specific integration test
npm run test:jest -- src/tests/integration/user-service.integration.spec.ts

# Run with verbose output
npm run test:jest -- src/tests/integration/user-service.integration.spec.ts --verbose

# Run in watch mode (reruns on file changes)
npm run test:jest:watch -- src/tests/integration/user-service.integration.spec.ts

# Run all integration tests
npm run test:integration

# Run with coverage
npm run test:jest:coverage -- src/tests/integration/user-service.integration.spec.ts
```

## 📋 **Quick Steps to Run Your Test**

**Fastest Method:**
1. Press `Ctrl+Shift+P`
2. Type "run task"
3. Select "Tasks: Run Task"
4. Choose "Run User Service Integration Test"
5. Watch the results in the terminal panel

## 🎛️ **VS Code Extensions That Help**

### **Recommended Extensions:**
1. **Jest** (by Orta) - Adds Jest test runner integration
2. **Jest Runner** (by firsttris) - Run/debug Jest tests from editor
3. **Test Explorer UI** - Visual test explorer interface

### **After Installing Jest Extension:**
- Tests appear in Test Explorer sidebar
- Green/red indicators in editor gutter
- Run/debug buttons in editor
- Automatic test discovery

## 🐛 **Debugging the Test**

### **To Debug Your Integration Test:**
1. **Set breakpoints** in your test file
2. **Command Palette**: `Ctrl+Shift+P`
3. **Type**: `Debug: Select and Start Debugging`
4. **Choose**: `Jest Debug` (if Jest extension installed)

### **Or use Terminal Debug:**
```bash
# Debug with Node inspector
npm run test:jest -- --runInBand --no-cache src/tests/integration/user-service.integration.spec.ts
```

## 📊 **Viewing Test Results**

### **In Terminal:**
- ✅ Green checkmarks for passing tests
- ❌ Red X's for failing tests
- Detailed error messages and stack traces

### **In Test Explorer (with extension):**
- Visual tree of all tests
- Click to run individual tests
- Status indicators (pass/fail/running)

## 🔄 **Watch Mode for Development**

For continuous testing while you develop:

```bash
npm run test:jest:watch -- src/tests/integration/user-service.integration.spec.ts
```

This will:
- Re-run tests when files change
- Show results immediately
- Allow filtering and focusing on specific tests

---

**Your integration test is ready to run using any of these methods!** The VS Code tasks I've configured make it easy to run with just a few clicks from the Command Palette or menu.
