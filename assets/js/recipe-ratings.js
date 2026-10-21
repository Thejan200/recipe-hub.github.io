import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

// These are public browser configuration values. Database access is limited by
// Supabase RLS and RPC permissions; no secret or service-role key is used here.
const SUPABASE_URL = 'https://bvdexkmfsdlcyqhjvvks.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_43sVfeQEkrFUZ9f0bILBAw_Fh7C9dWE';
const TURNSTILE_SITE_KEY = '0x4AAAAAAFdrGtqP_2byqHP_';

const root = document.querySelector('[data-recipe-rating]');

if (root) {
  const recipeSlug = root.dataset.recipeRating;
  const summary = root.querySelector('[data-rating-summary]');
  const status = root.querySelector('[data-rating-status]');
  const starButtons = [...root.querySelectorAll('[data-rating-value]')];
  const verifyPanel = root.querySelector('[data-rating-verify]');
  const turnstileContainer = root.querySelector('[data-turnstile-container]');
  const submitButton = root.querySelector('[data-rating-submit]');
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  let selectedRating = 0;
  let captchaToken = '';
  let turnstileWidgetId = null;
  let turnstileLoad;

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  };

  const renderSummary = (row) => {
    const count = Number(row?.rating_count || 0);
    const average = Number(row?.average_rating || 0);
    summary.textContent = count
      ? `${average.toFixed(1)} out of 5 from ${count} reader rating${count === 1 ? '' : 's'}`
      : 'No reader ratings yet.';
  };

  const selectStars = () => {
    starButtons.forEach((button) => {
      const value = Number(button.dataset.ratingValue);
      const active = value <= selectedRating;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-checked', String(value === selectedRating));
    });
  };

  const waitForTurnstile = async () => {
    if (!turnstileLoad) {
      turnstileLoad = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('The security check could not load. Please refresh and try again.'));
        document.head.appendChild(script);
      });
    }
    await turnstileLoad;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (window.turnstile) return window.turnstile;
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
    throw new Error('The security check could not load. Please refresh and try again.');
  };

  const prepareVerification = async () => {
    const { data: { session } } = await client.auth.getSession();
    if (session) {
      verifyPanel.hidden = true;
      submitButton.disabled = false;
      setStatus('Your rating is ready to submit.');
      return;
    }

    verifyPanel.hidden = false;
    submitButton.disabled = true;
    setStatus('Complete the security check, then submit your rating.');

    const turnstile = await waitForTurnstile();
    if (turnstileWidgetId !== null) {
      captchaToken = '';
      turnstile.reset(turnstileWidgetId);
      return;
    }

    turnstileWidgetId = turnstile.render(turnstileContainer, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'light',
      size: 'flexible',
      callback: (token) => {
        captchaToken = token;
        submitButton.disabled = false;
        setStatus('Security check complete. Submit your rating when ready.');
      },
      'expired-callback': () => {
        captchaToken = '';
        submitButton.disabled = true;
        setStatus('The security check expired. Please complete it again.', true);
      },
      'error-callback': () => {
        captchaToken = '';
        submitButton.disabled = true;
        setStatus('The security check could not be completed. Please refresh and try again.', true);
      }
    });
  };

  const submitRating = async () => {
    if (!selectedRating) return;

    submitButton.disabled = true;
    setStatus('Saving your rating…');

    try {
      let { data: { session } } = await client.auth.getSession();
      if (!session) {
        if (!captchaToken) throw new Error('Please complete the security check first.');
        const { data, error } = await client.auth.signInAnonymously({
          options: { captchaToken }
        });
        if (error) throw error;
        session = data.session;
      }

      if (!session) throw new Error('Your rating session could not be created. Please try again.');

      const { data, error } = await client.rpc('submit_recipe_rating', {
        p_recipe_slug: recipeSlug,
        p_rating: selectedRating
      });
      if (error) throw error;

      renderSummary(data?.[0]);
      verifyPanel.hidden = true;
      submitButton.textContent = 'Update rating';
      setStatus('Thank you — your rating has been saved. You can update it later from this browser.');
    } catch (error) {
      const message = error?.message || 'Your rating could not be saved. Please try again.';
      setStatus(message, true);
      const { data: { session } } = await client.auth.getSession();
      submitButton.disabled = !session;
    }
  };

  const loadSummary = async () => {
    try {
      const { data, error } = await client.rpc('recipe_rating_summary', {
        p_recipe_slug: recipeSlug
      });
      if (error) throw error;
      renderSummary(data?.[0]);
    } catch {
      summary.textContent = 'Reader ratings are temporarily unavailable.';
    }
  };

  const loadOwnRating = async () => {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;

      const { data, error } = await client.rpc('my_recipe_rating', {
        p_recipe_slug: recipeSlug
      });
      if (error) throw error;

      const savedRating = Number(data?.[0]?.rating || 0);
      if (!Number.isInteger(savedRating) || savedRating < 1 || savedRating > 5) return;

      selectedRating = savedRating;
      selectStars();
      verifyPanel.hidden = true;
      submitButton.disabled = false;
      submitButton.textContent = 'Update rating';
      setStatus(`Your saved rating is ${savedRating} out of 5. You can update it anytime from this browser.`);
    } catch {
      // Aggregate ratings still work if a saved browser rating cannot be restored.
    }
  };

  starButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      selectedRating = Number(button.dataset.ratingValue);
      selectStars();
      try {
        await prepareVerification();
      } catch (error) {
        setStatus(error?.message || 'The security check could not load. Please refresh and try again.', true);
      }
    });
  });

  submitButton.addEventListener('click', submitRating);
  loadSummary();
  loadOwnRating();
}
