from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Capture console messages
    console_logs = []
    page.on('console', lambda msg: console_logs.append(f'{msg.type}: {msg.text}'))

    print('Navigating to http://localhost:3777...')
    page.goto('http://localhost:3777', timeout=30000)
    page.wait_for_load_state('networkidle')

    print('Page loaded. Taking screenshot...')
    page.screenshot(path='tmp_test_screenshot.png', full_page=True)

    print('Page title:', page.title())
    print('Page URL:', page.url)

    # Check for visible elements
    header = page.locator('h1').first.text_content()
    print('Header text:', header)

    # Check buttons
    buttons = page.locator('button').all()
    print(f'Found {len(buttons)} buttons')

    # Check inputs
    inputs = page.locator('input').all()
    print(f'Found {len(inputs)} inputs')

    print()
    print('Console logs:')
    for log in console_logs[:10]:
        print(log)

    browser.close()
    print()
    print('Screenshot saved to tmp_test_screenshot.png')
