import { getKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import DesignWorkWrapper from '../../DesignWorkWrapper'

export default function KeyboardShortcutsHelp() {
  const shortcuts = getKeyboardShortcuts()

  return (
    <DesignWorkWrapper componentName="KeyboardShortcutsHelp">
      <div className="bg-medflow-surface/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-sm">
        <h3 className="font-medium text-medflow-text-primary mb-3">Scurtături tastatură</h3>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-medflow-text-muted">{shortcut.action}</span>
              <kbd className="bg-white/10 px-2 py-1 rounded text-xs text-medflow-text-primary">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </DesignWorkWrapper>
  )
}
