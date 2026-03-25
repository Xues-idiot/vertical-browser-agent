.PHONY: help install install-backend install-frontend dev backend frontend test lint clean docker-build docker-up docker-down validate

# Colors
GREEN  := \033[0;32m
CYAN   := \033[0;36m
YELLOW := \033[1;33m
RED    := \033[0;31m
NC     := \033[0m

# Project paths
BACKEND_DIR := backend
FRONTEND_DIR := frontend

help: ## Show this help message
	@echo "$(CYAN)Spider - 垂直浏览器Agent$(NC)"
	@echo ""
	@echo "$(GREEN)Usage:$(NC)"
	@echo "  make <target>"
	@echo ""
	@echo "$(GREEN)Targets:$(NC)"
	@awk 'BEGIN { FS = ":.*?## " } /^[a-zA-Z_-]+:.*?## / { printf "  %-20s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

## Install dependencies
install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend dependencies
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	@pip install -r $(BACKEND_DIR)/requirements.txt
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

## Development
dev: ## Run both backend and frontend
	@echo "$(CYAN)Starting Spider development servers...$(NC)"
	@echo "  Backend: http://localhost:8004"
	@echo "  Frontend: http://localhost:3777"
	@echo ""
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@./scripts/dev.sh

backend: ## Start backend only
	@echo "$(YELLOW)Starting backend...$(NC)"
	@cd $(BACKEND_DIR) && python -m backend.main

frontend: ## Start frontend only
	@echo "$(YELLOW)Starting frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

## Testing
test: ## Run all tests
	@echo "$(YELLOW)Running tests...$(NC)"
	@cd $(BACKEND_DIR) && python -m pytest tests/ -v

test-backend: ## Run backend tests
	@echo "$(YELLOW)Running backend tests...$(NC)"
	@cd $(BACKEND_DIR) && python -m pytest tests/ -v

test-frontend: ## Run frontend tests
	@echo "$(YELLOW)Running frontend tests...$(NC)"
	@cd $(FRONTEND_DIR) && npm run test

## Linting
lint: ## Run linters
	@echo "$(YELLOW)Running linters...$(NC)"
	@cd $(FRONTEND_DIR) && npm run lint

## Building
build: docker-build ## Build all Docker images

docker-build: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(NC)"
	@docker-compose build

## Running
docker-up: ## Start Docker containers
	@echo "$(YELLOW)Starting Docker containers...$(NC)"
	@docker-compose up -d
	@echo ""
	@echo "$(GREEN)✓ Spider is running!$(NC)"
	@echo "  Frontend: http://localhost:3777"
	@echo "  Backend:  http://localhost:8004"
	@echo "  API Docs: http://localhost:8004/docs"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

docker-restart: docker-down docker-up ## Restart Docker containers

## Validation
validate: ## Validate project setup
	@echo "$(YELLOW)Validating project...$(NC)"
	@./scripts/validate.sh

## Cleaning
clean: ## Clean up generated files
	@echo "$(YELLOW)Cleaning up...$(NC)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@rm -rf $(FRONTEND_DIR)/.next
	@rm -rf $(FRONTEND_DIR)/node_modules/.cache
	@echo "$(GREEN)✓ Clean complete$(NC)"

## Database (future)
db-migrate: ## Run database migrations (future)
	@echo "$(YELLOW)Running migrations...$(NC)"
	@echo "Coming soon!"

db-reset: ## Reset database (future)
	@echo "$(YELLOW)Resetting database...$(NC)"
	@echo "Coming soon!"

## Deployment
deploy: ## Deploy to production
	@echo "$(RED)This action is not configured yet$(NC)"
	@echo "Please configure your deployment strategy"

## Help
	@echo ""
	@echo "$(CYAN)Documentation:$(NC)"
	@echo "  README.md         - Project documentation"
	@echo "  backend/docs/     - API documentation"
	@echo "  CHANGELOG.md      - Version history"