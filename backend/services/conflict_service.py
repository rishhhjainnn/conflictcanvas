"""
Conflict resolution service for ConflictCanvas
Handles smart merging of simultaneous updates and field-level difference detection.
"""

from typing import Dict, Any, Tuple


class ConflictService:
    @staticmethod
    def detect_conflict(base_version: int, server_version: int) -> bool:
        """
        Detects if a conflict exists between the client's base version
        and current server version.
        """
        return base_version != server_version

    @staticmethod
    def smart_merge(
        client_changes: Dict[str, Any],
        server_changes: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], bool, list]:
        """
        Attempts to automatically merge client and server updates.
        Returns:
            merged_changes: Combined dictionary of non-conflicting fields
            has_conflict: True if overlapping fields have different values
            conflicting_fields: List of fields with opposing edits
        """
        merged = dict(server_changes)
        conflicts = []

        for field, client_val in client_changes.items():
            if field in server_changes:
                server_val = server_changes[field]
                if client_val != server_val:
                    conflicts.append(field)
                else:
                    merged[field] = client_val
            else:
                merged[field] = client_val

        has_conflict = len(conflicts) > 0
        return merged, has_conflict, conflicts
