export function ManualSourcesReloadButton(props) {
  function handleClick() {
    window.dispatchEvent(new Event('reloadCalendarSourcesCache'));
  }

  return (
    <button {...props} onClick={handleClick}>Reload Calendar Sources</button>
  );
}
